import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apps = await prisma.jobApplication.findMany({
    where: { userId: session.user.id },
    include: { interviewRounds: { orderBy: { date: 'asc' } } },
    orderBy: { appliedAt: 'desc' },
  });

  const rows = apps.map((a) => ({
    Company: a.company,
    Position: a.role,
    Location: a.location || '',
    Status: a.status,
    DateApplied: a.appliedAt.toISOString().split('T')[0],
    LastUpdated: a.updatedAt.toISOString().split('T')[0],
    JobLink: a.url || '',
    SalaryRange: a.salary || '',
    Source: a.source || '',
    RecruiterName: a.recruiterName || '',
    RecruiterContact: a.recruiterContact || '',
    FollowUpDate: a.followUpDate ? a.followUpDate.toISOString().split('T')[0] : '',
    Notes: a.notes || '',
    InterviewRounds: a.interviewRounds
      .map((r) => `${r.date.toISOString().split('T')[0]} (${r.type}): ${r.outcome || 'pending'}`)
      .join(' | '),
  }));

  const csv = Papa.unparse(rows);
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="job-applications-${new Date().toISOString().split('T')[0]}.csv"`,
    },
  });
}

// Template download
export async function OPTIONS() {
  const template = Papa.unparse([{
    Company: 'Acme Corp',
    Position: 'Software Engineer',
    Location: 'Remote',
    Status: 'applied',
    DateApplied: '2025-01-15',
    JobLink: 'https://example.com/jobs/123',
    SalaryRange: '$120k-$150k',
    Source: 'linkedin',
    RecruiterName: 'Jane Smith',
    RecruiterContact: 'jane@acme.com',
    Notes: 'Applied through LinkedIn referral',
    FollowUpDate: '2025-01-22',
  }]);

  return new NextResponse(template, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="job-tracker-template.csv"',
    },
  });
}
