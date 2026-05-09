import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { callAI, parseAIJson } from '@/lib/ai';

const SYSTEM_PROMPT = `You are an expert interview coach. Generate realistic, role-specific interview questions.
Return ONLY valid JSON (no markdown fences) with this structure:
{
  "questions": [
    {
      "id": "<unique short string>",
      "question": "...",
      "type": "behavioral|technical|situational|company",
      "difficulty": "easy|medium|hard",
      "hint": "Brief tip on how to approach this question",
      "framework": "STAR|problem-solution-result|direct|case"
    }
  ]
}
Tailor questions to the role, company, and difficulty level specified.
For behavioral: use STAR framework. For technical: be specific to the technology stack.
For company-specific: reference known practices (e.g. Amazon Leadership Principles, Google product sense).`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { interviewType, role, company, difficulty, count = 10, jobDescription, questionTypes } = await req.json();

  const userMessage = [
    `Interview type: ${interviewType}`,
    role ? `Target role: ${role}` : '',
    company ? `Target company: ${company}` : '',
    `Difficulty: ${difficulty || 'mid'}`,
    `Number of questions: ${count}`,
    questionTypes?.length ? `Question types to include: ${questionTypes.join(', ')}` : '',
    jobDescription ? `\nJob description context:\n${jobDescription.slice(0, 2000)}` : '',
  ].filter(Boolean).join('\n');

  try {
    const raw = await callAI(SYSTEM_PROMPT, userMessage, { maxTokens: 3000, jsonMode: true });
    const data = parseAIJson<{ questions: unknown[] }>(raw);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Generation failed.';
    if (msg.includes('AI_API_KEY')) {
      return NextResponse.json({ error: 'AI is not configured. Add AI_API_KEY to your .env file.' }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
