import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status');
  const source = searchParams.get('source');
  const q = searchParams.get('q');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const sortBy = searchParams.get('sortBy') || 'appliedAt';
  const sortDir = (searchParams.get('sortDir') || 'desc') as 'asc' | 'desc';

  const where: Record<string, unknown> = { userId: session.user.id };
  if (status && status !== 'all') where.status = status;
  if (source) where.source = source;
  if (q) {
    where.OR = [
      { company: { contains: q, mode: 'insensitive' } },
      { role: { contains: q, mode: 'insensitive' } },
      { notes: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (from || to) {
    where.appliedAt = {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    };
  }

  const validSortFields = ['appliedAt', 'updatedAt', 'company', 'role', 'status', 'followUpDate'];
  const orderField = validSortFields.includes(sortBy) ? sortBy : 'appliedAt';

  const applications = await prisma.jobApplication.findMany({
    where,
    orderBy: { [orderField]: sortDir },
    include: { interviewRounds: { orderBy: { date: 'asc' } } },
  });

  return NextResponse.json(applications);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { company, role, location, locationType, status, url, notes, salary, source, recruiterName, recruiterContact, followUpDate } = body;

  if (!company || !role) {
    return NextResponse.json({ error: 'Company and role are required.' }, { status: 400 });
  }

  const app = await prisma.jobApplication.create({
    data: {
      userId: session.user.id,
      company,
      role,
      location,
      locationType,
      status: status || 'applied',
      url,
      notes,
      salary,
      source,
      recruiterName,
      recruiterContact,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
    },
    include: { interviewRounds: true },
  });

  return NextResponse.json(app, { status: 201 });
}
