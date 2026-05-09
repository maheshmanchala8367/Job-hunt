import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ResumePDFDocument, ResumeData } from '@/lib/resume-pdf-template';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { resumeData } = (await req.json()) as { resumeData: ResumeData };
    if (!resumeData?.name) {
      return NextResponse.json({ error: 'Resume data is missing.' }, { status: 400 });
    }

    const buffer = await renderToBuffer(
      React.createElement(ResumePDFDocument, { data: resumeData }) as any
    );

    const firstName = (resumeData.name.split(' ')[0] ?? 'resume').toLowerCase();
    const uint8 = new Uint8Array(buffer);

    return new Response(uint8, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${firstName}_resume.pdf"`,
        'Content-Length': String(uint8.byteLength),
      },
    });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'PDF generation failed.' },
      { status: 500 }
    );
  }
}
