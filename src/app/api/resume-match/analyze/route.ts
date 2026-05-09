import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { callAI, parseAIJson } from '@/lib/ai';

const SYSTEM_PROMPT = `You are an expert ATS system and senior career coach.
Analyze the match between the provided resume and job description. Be specific, actionable, and honest.
Return ONLY valid JSON with this exact structure (no markdown fences):
{
  "score": <integer 0-100>,
  "atsIssues": [{"issue": "...", "severity": "high|medium|low", "suggestion": "..."}],
  "missingKeywords": {
    "high": [{"keyword": "...", "whereToAdd": "Summary|Skills|Experience", "howToPhrase": "..."}],
    "medium": [{"keyword": "...", "whereToAdd": "...", "howToPhrase": "..."}],
    "low": [{"keyword": "...", "whereToAdd": "...", "howToPhrase": "..."}]
  },
  "bulletSuggestions": [{"original": "...", "improved": "...", "reason": "..."}],
  "skillGaps": [{"skill": "...", "resources": [{"title": "...", "url": "...", "platform": "Coursera|YouTube|Official Docs|Udemy"}]}],
  "strengths": ["..."]
}
For bulletSuggestions: provide 3-5 rewrites of existing bullets to better match the JD.
For skillGaps: provide 1-3 resources per gap with real, working URLs.
For score: 70+ = strong match, 50-69 = moderate, below 50 = weak.`;

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { resumeText, jobDescription, jobTitle } = await req.json();

  if (!resumeText || !jobDescription) {
    return NextResponse.json({ error: 'Resume text and job description are required.' }, { status: 400 });
  }

  const userMessage = `JOB DESCRIPTION:\n${jobDescription}\n\nRESUME:\n${resumeText}`;

  try {
    const raw = await callAI(SYSTEM_PROMPT, userMessage, { maxTokens: 4096, jsonMode: true });
    const analysis = parseAIJson<Record<string, unknown>>(raw);

    // Persist analysis
    const saved = await prisma.resumeAnalysis.create({
      data: {
        userId: session.user.id,
        jobTitle: jobTitle || null,
        jobDescription,
        resumeText,
        score: (analysis.score as number) ?? 0,
        atsIssues: analysis.atsIssues ?? [],
        missingKeywords: analysis.missingKeywords ?? {},
        bulletSuggestions: analysis.bulletSuggestions ?? [],
        skillGaps: analysis.skillGaps ?? [],
        strengths: analysis.strengths ?? [],
      },
    });

    return NextResponse.json({ ...analysis, id: saved.id, createdAt: saved.createdAt });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI analysis failed.';
    if (msg.includes('AI_API_KEY')) {
      return NextResponse.json({ error: 'AI is not configured. Add AI_API_KEY to your .env file.' }, { status: 503 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
