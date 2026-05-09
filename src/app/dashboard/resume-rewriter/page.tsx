'use client';

import { useState } from 'react';
import {
  FileEdit, Upload, Loader2, Download, Sparkles, AlertCircle,
  FileText, ListChecks, Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ResumeData } from '@/lib/resume-pdf-template';

// ── Types ──────────────────────────────────────────────────────────────────────

interface NewBullet { role: string; bullets: string[] }
interface SkillSection { subsection: string; existing: string[]; added: string[] }
interface RewriteResult {
  id: string; createdAt: string;
  summary: string;
  newBullets: NewBullet[];
  updatedSkills: SkillSection[];
  fullResumeData: ResumeData;
}

// ── Tone options ───────────────────────────────────────────────────────────────

const TONES = [
  { id: 'Professional', label: 'Professional', desc: 'Formal, polished, executive-ready' },
  { id: 'ATS Optimized', label: 'ATS Optimized', desc: 'Keyword-dense, machine-readable' },
  { id: 'Concise', label: 'Concise', desc: 'Tight, impact-first, no filler words' },
  { id: 'Dynamic', label: 'Dynamic', desc: 'Strong action verbs, quantified results' },
];

// ── Resume HTML Preview — matches the PDF template layout ──────────────────────

function ResumePreview({ data }: { data: ResumeData }) {
  const contactParts = [
    data.contact?.location,
    data.contact?.phone,
    data.contact?.email,
    data.contact?.linkedin,
    data.contact?.github,
    data.contact?.website,
  ].filter(Boolean) as string[];

  return (
    <div className="font-['Times_New_Roman',_Times,_serif] text-[11px] leading-[1.35] text-black bg-white p-8 shadow-md min-h-[1056px] w-full max-w-[816px] mx-auto">

      {/* Header */}
      <div className="text-center mb-2">
        <p className="text-[22px] font-bold tracking-wide">{data.name}</p>
        <p className="text-[10px] mt-1">{contactParts.join(' | ')}</p>
      </div>

      {/* Summary */}
      {data.summary && (
        <section className="mt-3">
          <p className="font-bold uppercase text-[10.5px] tracking-wide border-b border-black pb-0.5 mb-1.5">Summary</p>
          <p className="text-[10px] leading-[1.4]">{data.summary}</p>
        </section>
      )}

      {/* Technical Skills */}
      {data.skills && data.skills.length > 0 && (
        <section className="mt-3">
          <p className="font-bold uppercase text-[10.5px] tracking-wide border-b border-black pb-0.5 mb-1.5">Technical Skills</p>
          {data.skills.map((s, i) => (
            <p key={i} className="text-[10px] mb-0.5">
              <span className="font-bold">• {s.category}: </span>
              {s.items.join(', ')}
            </p>
          ))}
        </section>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <section className="mt-3">
          <p className="font-bold uppercase text-[10.5px] tracking-wide border-b border-black pb-0.5 mb-1.5">Experience</p>
          {data.experience.map((exp, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[10.5px]">{exp.company}</span>
                <span className="text-[10px]">{exp.startDate} - {exp.endDate}</span>
              </div>
              <div className="flex justify-between items-baseline">
                <span className="italic text-[10px]">{exp.title}</span>
                <span className="italic text-[10px]">{exp.location}</span>
              </div>
              {(exp.bullets ?? []).map((b, j) => (
                <div key={j} className="flex gap-1.5 ml-3 mt-0.5">
                  <span className="shrink-0">•</span>
                  <span className="text-[10px] leading-[1.35]">{b.replace(/^[•\-–]\s*/, '')}</span>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <section className="mt-3">
          <p className="font-bold uppercase text-[10.5px] tracking-wide border-b border-black pb-0.5 mb-1.5">Education</p>
          {data.education.map((edu, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[10.5px]">{edu.institution}</span>
                <span className="text-[10px]">{edu.startDate} - {edu.endDate}</span>
              </div>
              <p className="italic text-[10px]">
                {edu.degree}{edu.gpa ? `  |  GPA: ${edu.gpa}` : ''}
              </p>
            </div>
          ))}
        </section>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <section className="mt-3">
          <p className="font-bold uppercase text-[10.5px] tracking-wide border-b border-black pb-0.5 mb-1.5">Projects</p>
          {data.projects.map((proj, i) => (
            <div key={i} className="mb-2">
              <p className="font-bold text-[10.5px]">{proj.name}</p>
              {proj.technologies && proj.technologies.length > 0 && (
                <p className="italic text-[10px] mb-0.5">Technologies: {proj.technologies.join(', ')}</p>
              )}
              {(proj.bullets ?? []).map((b, j) => (
                <div key={j} className="flex gap-1.5 ml-3 mt-0.5">
                  <span className="shrink-0">•</span>
                  <span className="text-[10px] leading-[1.35]">{b.replace(/^[•\-–]\s*/, '')}</span>
                </div>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <section className="mt-3">
          <p className="font-bold uppercase text-[10.5px] tracking-wide border-b border-black pb-0.5 mb-1.5">Certifications</p>
          {data.certifications.map((cert, i) => (
            <div key={i} className="mb-1.5">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-[10.5px]">{cert.name}</span>
                {cert.date && <span className="text-[10px]">{cert.date}</span>}
              </div>
              {cert.issuer && <p className="italic text-[10px]">{cert.issuer}</p>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// ── Change Log panel ───────────────────────────────────────────────────────────

function ChangeLog({ result }: { result: RewriteResult }) {
  return (
    <div className="space-y-5 text-sm">
      {/* Summary */}
      <div>
        <p className="font-semibold text-gray-900 dark:text-white mb-2">Rewritten Summary</p>
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
          <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-xs">{result.summary}</p>
        </div>
      </div>

      {/* New bullets */}
      {result.newBullets.length > 0 && (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-2">
            New / Rewritten Bullets
            <span className="ml-2 text-xs font-normal text-gray-400">
              ({result.newBullets.reduce((a, b) => a + b.bullets.length, 0)} total)
            </span>
          </p>
          {result.newBullets.map((section, i) => (
            <div key={i} className="mb-3">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">{section.role}</p>
              {section.bullets.map((bullet, j) => (
                <div key={j} className="flex gap-2 p-2.5 rounded-xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900 mb-1.5">
                  <span className="text-green-600 font-bold shrink-0 text-xs">+</span>
                  <p className="text-xs text-gray-800 dark:text-gray-200">{bullet.replace(/^[•+]\s*/, '')}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Skills added */}
      {result.updatedSkills.length > 0 && result.updatedSkills.some(s => s.added.length > 0) && (
        <div>
          <p className="font-semibold text-gray-900 dark:text-white mb-2">Skills Added from JD</p>
          <div className="flex flex-wrap gap-2">
            {result.updatedSkills.flatMap(s => s.added).map((skill, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">
                {skill}
              </span>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-1.5">⚡ = newly added from the job description</p>
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ResumeRewriterPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RewriteResult | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'changes'>('preview');

  async function loadProfileResume() {
    const res = await fetch('/api/user/profile');
    const data = await res.json();
    if (data.baseResume) setResumeText(data.baseResume);
    else alert('No base resume saved in profile. Paste your resume below.');
  }

  async function handleRewrite() {
    if (!resumeText.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);

    const res = await fetch('/api/resume-rewriter/rewrite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription, tone }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Rewrite failed.'); return; }
    setResult(data);
    setActiveTab('preview');
  }

  async function handleDownloadPDF() {
    if (!result?.fullResumeData) return;
    setDownloading(true);
    try {
      const res = await fetch('/api/resume-rewriter/export-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: result.fullResumeData }),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(err.error || 'PDF generation failed.');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const firstName = (result.fullResumeData.name?.split(' ')[0] ?? 'resume').toLowerCase();
      a.href = url;
      a.download = `${firstName}_resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('PDF download failed. Please try again.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Resume Rewriter</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          AI rewrites your complete resume for any job — download as a polished PDF instantly.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* ── Left: Inputs ────────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Tone */}
          <div className="card p-5">
            <label className="label">Rewrite Style</label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button key={t.id} onClick={() => setTone(t.id)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all',
                    tone === t.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}>
                  <p className={cn('text-sm font-medium', tone === t.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100')}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Job Description */}
          <div className="card p-5">
            <label className="label flex items-center gap-2">
              <FileEdit className="w-4 h-4" /> Target Job Description
            </label>
            <p className="text-xs text-gray-400 mb-2">Paste the JD to get a targeted rewrite.</p>
            <textarea rows={6} value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here…"
              className="input resize-none" />
          </div>

          {/* Resume */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Your Resume
              </label>
              <button onClick={loadProfileResume}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                Load from profile
              </button>
            </div>
            <textarea rows={14} value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume text here…

The AI will rewrite the complete resume:
• Summary — targeted to the job description
• All experience bullets — stronger verbs, quantified impact
• Skills — existing preserved + missing JD keywords added
• Projects & Education — kept accurate, polished

Download the result as a formatted PDF."
              className="input resize-none font-mono text-xs leading-relaxed" />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button onClick={handleRewrite} disabled={loading || !resumeText.trim()}
            className="btn-primary w-full py-3 text-base">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Rewriting entire resume…' : 'Rewrite Full Resume'}
          </button>
        </div>

        {/* ── Right: Output ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">

          {!result && !loading && (
            <div className="card p-16 text-center flex-1 flex flex-col items-center justify-center">
              <FileText className="w-14 h-14 text-gray-300 dark:text-gray-700 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Your rewritten resume appears here
              </h2>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                The AI rewrites every section of your resume and produces a downloadable PDF matching your original template format.
              </p>
            </div>
          )}

          {loading && (
            <div className="card p-16 text-center flex-1 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <p className="text-gray-500 font-medium">Rewriting your complete resume…</p>
              <p className="text-xs text-gray-400">Analysing JD · rewriting every section · formatting PDF…</p>
            </div>
          )}

          {result && !loading && (
            <>
              {/* Download button */}
              <button onClick={handleDownloadPDF} disabled={downloading}
                className="btn-primary py-3 w-full text-base flex items-center justify-center gap-2">
                {downloading
                  ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating PDF…</>
                  : <><Download className="w-5 h-5" /> Download PDF</>
                }
              </button>

              {/* Tabs */}
              <div className="card overflow-hidden flex-1">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                  <button onClick={() => setActiveTab('preview')}
                    className={cn(
                      'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                      activeTab === 'preview'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    )}>
                    <FileText className="w-4 h-4" /> Resume Preview
                  </button>
                  <button onClick={() => setActiveTab('changes')}
                    className={cn(
                      'flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
                      activeTab === 'changes'
                        ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                    )}>
                    <ListChecks className="w-4 h-4" /> What Changed
                    {result.newBullets.length > 0 && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                        {result.newBullets.reduce((a, b) => a + b.bullets.length, 0)}
                      </span>
                    )}
                  </button>
                </div>

                {activeTab === 'preview' && (
                  <div className="overflow-auto bg-gray-100 dark:bg-gray-800 p-4">
                    <ResumePreview data={result.fullResumeData} />
                  </div>
                )}

                {activeTab === 'changes' && (
                  <div className="p-5 overflow-auto">
                    <ChangeLog result={result} />
                    <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 space-y-1">
                      <p className="font-semibold text-gray-700 dark:text-gray-300">The full resume is already reflected in the Preview tab.</p>
                      <p>Click <strong>Download PDF</strong> to get the formatted file ready to submit.</p>
                      <p>The PDF format matches the template you provided.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
