import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const app = await prisma.jobApplication.findFirst({
    where: { id: params.id, userId: session.user.id },
  });
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { date, type, interviewers, notes, outcome } = await req.json();
  const round = await prisma.interviewRound.create({
    data: { jobApplicationId: params.id, date: new Date(date), type, interviewers, notes, outcome },
  });
  return NextResponse.json(round, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { roundId } = await req.json();
  const round = await prisma.interviewRound.findFirst({
    where: { id: roundId, jobApplication: { userId: session.user.id } },
  });
  if (!round) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.interviewRound.delete({ where: { id: roundId } });
  return NextResponse.json({ success: true });
}
