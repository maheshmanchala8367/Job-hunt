import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const interviewType = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '20');

  const where: Record<string, unknown> = { userId: session.user.id };
  if (interviewType) where.interviewType = interviewType;

  const sessions = await prisma.interviewSession.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { interviewType, role, company, difficulty, isMock } = await req.json();

  const interviewSession = await prisma.interviewSession.create({
    data: {
      userId: session.user.id,
      interviewType: interviewType || 'behavioral',
      role: role || null,
      company: company || null,
      difficulty: difficulty || 'mid',
      isMock: isMock || false,
      questions: [],
    },
  });

  return NextResponse.json(interviewSession, { status: 201 });
}
