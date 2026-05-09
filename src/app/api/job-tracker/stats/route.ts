import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [allApps, followUps] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { userId },
      select: { status: true, source: true, appliedAt: true },
      orderBy: { appliedAt: 'asc' },
    }),
    prisma.jobApplication.findMany({
      where: {
        userId,
        followUpDate: { gte: today, lte: sevenDaysFromNow },
        status: { notIn: ['offer', 'rejected', 'withdrawn'] },
      },
      select: { id: true, company: true, role: true, status: true, followUpDate: true },
      orderBy: { followUpDate: 'asc' },
    }),
  ]);

  // Status distribution
  const statusCounts = allApps.reduce<Record<string, number>>((acc, a) => {
    acc[a.status] = (acc[a.status] ?? 0) + 1;
    return acc;
  }, {});

  // Source distribution
  const sourceCounts = allApps.reduce<Record<string, number>>((acc, a) => {
    const s = a.source || 'other';
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  // Weekly application trend (last 12 weeks)
  const weeklyData: { week: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = new Date(Date.now() - i * 7 * 86400000);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
    const weekEnd = new Date(weekStart.getTime() + 7 * 86400000);
    const count = allApps.filter(
      (a) => new Date(a.appliedAt) >= weekStart && new Date(a.appliedAt) < weekEnd
    ).length;
    weeklyData.push({
      week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count,
    });
  }

  return NextResponse.json({
    total: allApps.length,
    statusCounts,
    sourceCounts,
    weeklyData,
    followUps,
    activeInterviews: (statusCounts['interviewing'] ?? 0) + (statusCounts['phone_screen'] ?? 0),
    offers: statusCounts['offer'] ?? 0,
    rejected: statusCounts['rejected'] ?? 0,
  });
}
