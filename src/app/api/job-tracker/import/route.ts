import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

interface CSVRow {
  Company?: string;
  Position?: string;
  Location?: string;
  Status?: string;
  DateApplied?: string;
  JobLink?: string;
  SalaryRange?: string;
  Source?: string;
  RecruiterName?: string;
  RecruiterContact?: string;
  Notes?: string;
  FollowUpDate?: string;
}

const STATUS_MAP: Record<string, string> = {
  saved: 'saved',
  applied: 'applied',
  'phone screen': 'phone_screen',
  phone_screen: 'phone_screen',
  interviewing: 'interviewing',
  interview: 'interviewing',
  offer: 'offer',
  rejected: 'rejected',
  withdrawn: 'withdrawn',
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });

  const text = await file.text();
  const { data, errors } = Papa.parse<CSVRow>(text, { header: true, skipEmptyLines: true });

  if (errors.length > 0 && data.length === 0) {
    return NextResponse.json({ error: 'Could not parse CSV file.' }, { status: 400 });
  }

  const created: unknown[] = [];
  const skipped: string[] = [];

  for (const row of data) {
    if (!row.Company || !row.Position) {
      skipped.push(`Row missing Company or Position`);
      continue;
    }
    try {
      const app = await prisma.jobApplication.create({
        data: {
          userId: session.user.id,
          company: row.Company.trim(),
          role: row.Position.trim(),
          location: row.Location?.trim() || null,
          status: STATUS_MAP[row.Status?.toLowerCase().trim() ?? ''] || 'applied',
          url: row.JobLink?.trim() || null,
          salary: row.SalaryRange?.trim() || null,
          source: row.Source?.toLowerCase().replace(/\s+/g, '_').trim() || null,
          recruiterName: row.RecruiterName?.trim() || null,
          recruiterContact: row.RecruiterContact?.trim() || null,
          notes: row.Notes?.trim() || null,
          appliedAt: row.DateApplied ? new Date(row.DateApplied) : new Date(),
          followUpDate: row.FollowUpDate ? new Date(row.FollowUpDate) : null,
        },
      });
      created.push(app);
    } catch {
      skipped.push(`${row.Company} — ${row.Position}`);
    }
  }

  return NextResponse.json({ imported: created.length, skipped: skipped.length, skippedItems: skipped });
}
