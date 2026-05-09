import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { searchJobs } from '@/lib/scrapers';

export const maxDuration = 30; // seconds (vercel)

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const query = searchParams.get('q') ?? '';
  const location = searchParams.get('location') ?? '';
  const sinceHoursRaw = searchParams.get('since');
  const sinceHours = sinceHoursRaw ? parseInt(sinceHoursRaw) : undefined;
  const sources = searchParams.get('sources')?.split(',').filter(Boolean);
  const companies = searchParams.get('companies')?.split(',').filter(Boolean);
  const remote = searchParams.get('remote') === 'true';

  const result = await searchJobs({ query, location, sinceHours, sources, companies, remote });

  return NextResponse.json(result);
}
