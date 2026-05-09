import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today); weekStart.setDate(weekStart.getDate() - 7);

  const [allSessions, todaySessions, weekSessions] = await Promise.all([
    prisma.interviewSession.findMany({
      where: { userId, completedAt: { not: null } },
      select: { interviewType: true, avgScore: true, questions: true, createdAt: true },
    }),
    prisma.interviewSession.count({ where: { userId, createdAt: { gte: today }, completedAt: { not: null } } }),
    prisma.interviewSession.count({ where: { userId, createdAt: { gte: weekStart }, completedAt: { not: null } } }),
  ]);

  // Avg score by type
  const scoreByType: Record<string, number[]> = {};
  for (const s of allSessions) {
    if (!s.avgScore) continue;
    const t = s.interviewType;
    if (!scoreByType[t]) scoreByType[t] = [];
    scoreByType[t].push(s.avgScore);
  }
  const avgByType = Object.fromEntries(
    Object.entries(scoreByType).map(([t, scores]) => [
      t,
      Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    ])
  );

  return NextResponse.json({
    total: allSessions.length,
    today: todaySessions,
    thisWeek: weekSessions,
    avgByType,
  });
}
