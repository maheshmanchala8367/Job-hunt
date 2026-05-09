import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { callAI, parseAIJson } from '@/lib/ai';

const SYSTEM_PROMPT = (tone: string) => `You are an expert resume writer and career coach.

Given a resume and a job description, REWRITE THE COMPLETE RESUME so it is:
- Fully targeted to the job description
- Using strong action verbs and quantified achievements
- ATS-optimized with keywords from the JD woven in naturally
- Tone: ${tone}

STRICT RULES:
1. Preserve ALL personal facts: name, phone, email, company names, job titles, dates, university, GPA, LinkedIn.
2. Do NOT invent experience, projects, or credentials that are not in the original resume.
3. Reframe, strengthen, and quantify bullets using details already present.
4. Rewrite the summary to target the specific role.
5. Carry over ALL existing skills. Add skills explicitly required by the JD that are missing (mark with ⚡).
6. Output ONLY valid JSON — no markdown fences, no commentary outside the JSON.

Return this EXACT JSON structure:
{
  "name": "Full name from the resume",
  "contact": {
    "location": "City, State",
    "phone": "phone number",
    "email": "email",
    "linkedin": "LinkedIn URL or handle if present, else omit",
    "github": "GitHub if present, else omit",
    "website": "website if present, else omit"
  },
  "summary": "Rewritten 3-4 sentence summary laser-targeted at the JD",
  "skills": [
    { "category": "Category name exactly as original", "items": ["skill1", "skill2"] }
  ],
  "experience": [
    {
      "company": "Exact company name",
      "title": "Exact job title",
      "location": "Exact location",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY or Present",
      "bullets": [
        "Strong action verb + what you did + measurable result"
      ]
    }
  ],
  "education": [
    {
      "institution": "Exact university name",
      "degree": "Degree, Major",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY",
      "gpa": "GPA if listed, otherwise omit this field"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "technologies": ["tech1", "tech2"],
      "bullets": ["Rewritten project bullet"]
    }
  ],
  "certifications": [],
  "changeLog": {
    "summaryNote": "One sentence on what changed in the summary",
    "newBullets": [
      { "role": "Title / Company", "bullets": ["• New or significantly rewritten bullet"] }
    ],
    "skillsAdded": ["⚡ New Skill 1"]
  }
}`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { resumeText, jobDescription, tone = 'Professional' } = await req.json();
  if (!resumeText) return NextResponse.json({ error: 'Resume text is required.' }, { status: 400 });

  const userMessage = jobDescription
    ? `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`
    : `RESUME:\n${resumeText}\n\nNo job description provided — optimize for general clarity and impact.`;

  try {
    const raw = await callAI(SYSTEM_PROMPT(tone), userMessage, { maxTokens: 6000, jsonMode: true });
    const result = parseAIJson<Record<string, unknown>>(raw);

    // Extract change log for backward-compat UI
    const changeLog = (result.changeLog ?? {}) as Record<string, unknown>;
    const newBullets = changeLog.newBullets ?? [];
    const skillsAdded = changeLog.skillsAdded ?? [];

    // Build updatedSkills in old format so existing UI still works
    const updatedSkills = skillsAdded instanceof Array && skillsAdded.length > 0
      ? [{ subsection: 'Skills', existing: [], added: skillsAdded }]
      : [];

    // Strip changeLog from what we store as fullResumeData
    const { changeLog: _cl, ...fullResumeData } = result;

    const saved = await prisma.resumeRewrite.create({
      data: {
        userId: session.user.id,
        jobDescription: jobDescription || null,
        originalResume: resumeText,
        summary: (result.summary as string) || null,
        newBullets,
        updatedSkills,
        fullResumeData: fullResumeData as object,
        tone,
      },
    });

    return NextResponse.json({
      id: saved.id,
      createdAt: saved.createdAt,
      summary: result.summary,
      newBullets,
      updatedSkills,
      fullResumeData,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Rewrite failed.';
    if (msg.includes('AI_API_KEY')) {
      return NextResponse.json({ error: 'AI is not configured. Add AI_API_KEY to your .env file.' }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
