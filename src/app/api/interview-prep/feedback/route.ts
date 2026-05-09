import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { callAI, parseAIJson } from '@/lib/ai';

const SYSTEM_PROMPT = `You are a senior interview coach evaluating a candidate's answer.
Return ONLY valid JSON (no markdown fences) with this structure:
{
  "score": <1-10>,
  "starAnalysis": {
    "situation": { "present": true/false, "quality": "strong|adequate|weak|missing", "feedback": "..." },
    "task":      { "present": true/false, "quality": "...", "feedback": "..." },
    "action":    { "present": true/false, "quality": "...", "feedback": "..." },
    "result":    { "present": true/false, "quality": "...", "feedback": "..." }
  },
  "clarity": "strong|adequate|unclear",
  "specificity": "highly specific|somewhat specific|too vague",
  "strengths": ["..."],
  "improvements": ["..."],
  "modelAnswer": "A well-structured model answer using the candidate's context and experience..."
}
Be constructive, specific, and encouraging. The modelAnswer should be realistic, not generic.
Only include starAnalysis when the question type is behavioral.`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { question, answer, questionType, role, resumeSnippet } = await req.json();

  if (!question || !answer) {
    return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 });
  }

  const userMessage = [
    `Question: ${question}`,
    `Question type: ${questionType || 'behavioral'}`,
    role ? `Role being interviewed for: ${role}` : '',
    resumeSnippet ? `Candidate background: ${resumeSnippet.slice(0, 500)}` : '',
    `\nCandidate's answer:\n${answer}`,
  ].filter(Boolean).join('\n');

  try {
    const raw = await callAI(SYSTEM_PROMPT, userMessage, { maxTokens: 2000, jsonMode: true });
    const feedback = parseAIJson(raw);
    return NextResponse.json(feedback);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Feedback generation failed.';
    if (msg.includes('AI_API_KEY')) {
      return NextResponse.json({ error: 'AI is not configured. Add AI_API_KEY to your .env file.' }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
