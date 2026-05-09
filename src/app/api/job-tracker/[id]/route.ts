import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function getOwnedApp(userId: string, id: string) {
  return prisma.jobApplication.findFirst({ where: { id, userId } });
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const app = await prisma.jobApplication.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: { interviewRounds: { orderBy: { date: 'asc' } } },
  });
  if (!app) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(app);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owned = await getOwnedApp(session.user.id, params.id);
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const updated = await prisma.jobApplication.update({
    where: { id: params.id },
    data: {
      company: body.company,
      role: body.role,
      location: body.location,
      locationType: body.locationType,
      status: body.status,
      url: body.url,
      notes: body.notes,
      salary: body.salary,
      source: body.source,
      recruiterName: body.recruiterName,
      recruiterContact: body.recruiterContact,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
    },
    include: { interviewRounds: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const owned = await getOwnedApp(session.user.id, params.id);
  if (!owned) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.jobApplication.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
