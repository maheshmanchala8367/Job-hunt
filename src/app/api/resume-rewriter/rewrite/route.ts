import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { callAI, parseAIJson } from '@/lib/ai';

const SYSTEM_PROMPT = (tone: string) => `You are a senior ATS resume specialist. 70–80% of resumes are rejected by ATS before a human sees them. Your job is to make sure this one passes.

TASK: Rewrite the complete resume to maximise ATS keyword coverage and land in front of a recruiter. Tone: ${tone}.

═══ STEP 1 — KEYWORD EXTRACTION ═══
Before rewriting anything, scan the JD and extract:
- PRIMARY keywords: appear in the job title, first paragraph, or 2+ times in the JD
- SECONDARY keywords: appear once in requirements or responsibilities
- Exact strings matter — if JD says "Apache Spark" add "Apache Spark" not just "Spark"

═══ STEP 2 — KEYWORD INJECTION RULES ═══
Every missing keyword MUST be placed somewhere. Use this priority order:
1. Skills section first — add every missing tool/technology/methodology as an exact string
2. Summary — absorb broad keywords as natural competency claims (6–8 keywords max)
3. Experience bullets — for specific tools, inject as the instrument of work already done
4. PRIMARY keywords must appear in at least 2 locations (e.g. Skills + bullet)
5. SECONDARY keywords must appear in at least 1 location
6. Every injected keyword must be load-bearing — it cannot be removed without breaking the sentence
7. No keyword appears more than 3 times (avoid stuffing penalties)

═══ STEP 3 — BULLET REWRITING RULES ═══
Rewrite EVERY bullet using: [Strong Verb] + [what/how] + [measurable result]
- Quantify with numbers, %, timeframes, or scale wherever the original hints at it
- If no metric exists, quantify scope: "across 4 teams", "for 2M+ users", "in a $50M portfolio"
- Max 2 lines per bullet. No first-person pronouns.
- Strong verbs by type: Architected, Engineered, Spearheaded, Orchestrated, Drove, Scaled,
  Automated, Streamlined, Synthesized, Partnered, Championed — vary them, never repeat in same section

═══ STEP 4 — SUMMARY RULES ═══
- Open with exact JD job title + years of experience
- 3–5 sentences, 60–100 words, one paragraph
- Weave in 4–6 primary JD keywords naturally
- Close with a value statement tied to what the employer needs most
- No first-person pronouns, no company names, no filler ("results-driven", "passionate", "dynamic")

═══ STEP 5 — SKILLS RULES ═══
- Keep every existing skill exactly as-is
- Add every missing JD keyword as its exact string — use the JD's exact phrasing
- Mark newly added skills with ⚡
- Place most JD-relevant skills first within each subsection

═══ HARD LIMITS ═══
- Preserve ALL personal facts: name, contact, company names, job titles, dates, university, GPA
- Do NOT invent experience, certifications, or credentials not in the original resume
- Output ONLY valid JSON — no markdown fences, no commentary outside the JSON

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
