import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const interviewSession = await prisma.interviewSession.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!interviewSession) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(interviewSession);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owned = await prisma.interviewSession.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.interviewSession.update({
    where: { id: params.id },
    data: {
      questions: body.questions ?? owned.questions,
      avgScore: body.avgScore ?? owned.avgScore,
      completedAt: body.completedAt ? new Date(body.completedAt) : owned.completedAt,
    },
  });
  return NextResponse.json(updated);
}
