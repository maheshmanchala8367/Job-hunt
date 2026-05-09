import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalApplications,
      lastResumeMatch,
      interviewSessionsThisWeek,
      totalAskAiSessions,
      totalRewrites,
      recentApplications,
    ] = await Promise.all([
      prisma.jobApplication.count({ where: { userId } }),
      prisma.resumeAnalysis.findFirst({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: { score: true, createdAt: true },
      }),
      prisma.interviewSession.count({ where: { userId, createdAt: { gte: oneWeekAgo } } }),
      prisma.askAISession.count({ where: { userId } }),
      prisma.resumeRewrite.count({ where: { userId } }),
      prisma.jobApplication.findMany({
        where: { userId },
        orderBy: { appliedAt: 'desc' },
        take: 5,
        select: { id: true, company: true, role: true, status: true, appliedAt: true },
      }),
    ]);

    return NextResponse.json({
      totalApplications,
      lastResumeMatch,
      interviewSessionsThisWeek,
      totalAskAiSessions,
      totalRewrites,
      recentApplications,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[dashboard/stats]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
