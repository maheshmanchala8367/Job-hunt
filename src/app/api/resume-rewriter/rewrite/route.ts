import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { callAI, parseAIJson } from '@/lib/ai';

// Exact tailoring prompt per user specification
const buildSystemPrompt = (tone: string) => `You are an expert resume writer and career coach.
I will provide a resume and a job description (JD). Regenerate relevant sections following these instructions exactly:

SUMMARY
Rewrite the entire summary by blending the original with JD requirements.
The new summary should fully align with the JD while reflecting the candidate's actual background.
Keep it one paragraph, natural, and focused on skills, accomplishments, and relevant work.
Do not include company names in the summary.

EXPERIENCE
Add new bullets only under a maximum of two relevant experience sections.
Each section may have a maximum of two new bullets.
New bullets must: reflect a specific JD requirement, name the relevant skill and describe how it was applied, follow the same tone and format as existing bullets.

SKILLS
Keep all existing skills exactly as they are under their original subsections.
Add only skills explicitly or strongly implied by the JD that are not already listed.
Newly added skills should be short (1–2 words) and marked with ⚡ Missing.
Use only the same subsections already in the resume — do not add new subsection names.

TONE: ${tone}. Professional, concise, naturally aligned to the JD.
Emphasize achievements, technical or domain expertise, and measurable results where possible.
Do not exaggerate or invent experience — only surface and reframe what's already there.

Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "summary": "Regenerated one-paragraph summary",
  "newBullets": [
    { "role": "Role Title / Company", "bullets": ["• New bullet 1", "• New bullet 2"] }
  ],
  "updatedSkills": [
    { "subsection": "Technical Skills", "existing": ["Skill1", "Skill2"], "added": ["⚡ Missing Skill"] }
  ]
}`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { resumeText, jobDescription, tone = 'Professional' } = await req.json();

  if (!resumeText) {
    return NextResponse.json({ error: 'Resume text is required.' }, { status: 400 });
  }

  const userMessage = jobDescription
    ? `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`
    : `RESUME:\n${resumeText}\n\nNo specific job description provided — optimize for general impact and clarity.`;

  try {
    const raw = await callAI(buildSystemPrompt(tone), userMessage, { maxTokens: 4096, jsonMode: true });
    const result = parseAIJson<Record<string, unknown>>(raw);

    const saved = await prisma.resumeRewrite.create({
      data: {
        userId: session.user.id,
        jobDescription: jobDescription || null,
        originalResume: resumeText,
        summary: (result.summary as string) || null,
        newBullets: result.newBullets ?? [],
        updatedSkills: result.updatedSkills ?? [],
        tone,
      },
    });

    return NextResponse.json({ ...result, id: saved.id, createdAt: saved.createdAt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Rewrite failed.';
    if (msg.includes('AI_API_KEY')) {
      return NextResponse.json({ error: 'AI is not configured. Add AI_API_KEY to your .env file.' }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
