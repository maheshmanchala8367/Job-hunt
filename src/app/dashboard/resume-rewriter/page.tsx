'use client';

import { useState } from 'react';
import {
  FileEdit, Upload, Loader2, Copy, Check, Sparkles, AlertCircle,
  ChevronDown, ChevronUp, History,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface NewBullet { role: string; bullets: string[] }
interface SkillSection { subsection: string; existing: string[]; added: string[] }

interface RewriteResult {
  id: string; createdAt: string;
  summary: string;
  newBullets: NewBullet[];
  updatedSkills: SkillSection[];
}

// ── Tone definitions ───────────────────────────────────────────────────────────

const TONES = [
  { id: 'Professional', label: 'Professional', desc: 'Formal, polished, executive-ready' },
  { id: 'ATS Optimized', label: 'ATS Optimized', desc: 'Keyword-dense, machine-readable' },
  { id: 'Concise', label: 'Concise', desc: 'Tight, impact-first, no filler words' },
  { id: 'Dynamic', label: 'Dynamic', desc: 'Strong action verbs, quantified results' },
];

// ── Results section ────────────────────────────────────────────────────────────

function ResultsPanel({ result, originalResume }: { result: RewriteResult; originalResume: string }) {
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>('summary');

  function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    const open = openSection === id;
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          className="flex items-center justify-between w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setOpenSection(open ? null : id)}
        >
          <span className="font-medium text-gray-900 dark:text-white text-sm">{title}</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {open && <div className="p-4 border-t border-gray-100 dark:border-gray-800">{children}</div>}
      </div>
    );
  }

  // Build a full text output for copying
  const fullOutput = [
    '=== SUMMARY ===',
    result.summary,
    '',
    '=== NEW EXPERIENCE BULLETS ===',
    ...result.newBullets.flatMap((b) => [`\n${b.role}:`, ...b.bullets]),
    '',
    '=== UPDATED SKILLS ===',
    ...result.updatedSkills.flatMap((s) => [
      `\n${s.subsection}:`,
      ...s.existing.map((e) => `  ${e}`),
      ...s.added.map((a) => `  ${a}`),
    ]),
  ].join('\n');

  async function handleCopy() {
    await navigator.clipboard.writeText(fullOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900 dark:text-white">Tailored Resume Sections</h2>
        <button onClick={handleCopy} className="btn-secondary py-1.5 px-3 text-xs">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copied!' : 'Copy all'}
        </button>
      </div>

      {/* Summary */}
      <Section id="summary" title="Rewritten Summary">
        <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{result.summary}</p>
        </div>
      </Section>

      {/* New bullets */}
      {result.newBullets.length > 0 && (
        <Section id="bullets" title={`New Experience Bullets (${result.newBullets.reduce((a, b) => a + b.bullets.length, 0)} bullets across ${result.newBullets.length} roles)`}>
          <div className="space-y-5">
            {result.newBullets.map((section, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-gray-800">
                  {section.role}
                </p>
                <div className="space-y-2">
                  {section.bullets.map((bullet, j) => (
                    <div key={j} className="flex items-start gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900">
                      <span className="text-green-600 font-bold shrink-0">+</span>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Skills */}
      {result.updatedSkills.length > 0 && (
        <Section id="skills" title="Updated Skills Sections">
          <div className="space-y-5">
            {result.updatedSkills.map((section, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{section.subsection}</p>
                <div className="flex flex-wrap gap-2">
                  {section.existing.map((s, j) => (
                    <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{s}</span>
                  ))}
                  {section.added.map((s, j) => (
                    <span key={j} className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 font-medium">{s}</span>
                  ))}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-400">⚡ = newly added skills from the job description</p>
          </div>
        </Section>
      )}

      {/* How to use guide */}
      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 space-y-1">
        <p className="font-semibold text-gray-700 dark:text-gray-300">How to apply these changes:</p>
        <p>1. Copy your new summary and replace the existing one in your resume.</p>
        <p>2. Add the new bullets under the specified experience sections.</p>
        <p>3. Merge the updated skills into their existing subsections (⚡ items are new additions).</p>
        <p>4. Review and adjust to match your exact voice and formatting.</p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ResumeRewriterPage() {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('Professional');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<RewriteResult | null>(null);

  async function loadProfileResume() {
    const res = await fetch('/api/user/profile');
    const data = await res.json();
    if (data.baseResume) setResumeText(data.baseResume);
    else alert('No base resume saved. Go to Profile to add one.');
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
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Resume Rewriter</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">AI tailors your resume to match any job description without inventing experience.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* ── Left: inputs ─────────────────────────────────────── */}
        <div className="space-y-4">
          {/* Tone */}
          <div className="card p-5">
            <label className="label">Rewrite Style</label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTone(t.id)}
                  className={cn(
                    'p-3 rounded-xl border-2 text-left transition-all',
                    tone === t.id
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <p className={cn('text-sm font-medium', tone === t.id ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100')}>
                    {t.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Job description */}
          <div className="card p-5">
            <label className="label flex items-center gap-2">
              <FileEdit className="w-4 h-4" /> Target Job Description
            </label>
            <p className="text-xs text-gray-400 mb-2">Optional but strongly recommended for keyword alignment.</p>
            <textarea
              rows={6}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here…"
              className="input resize-none"
            />
          </div>

          {/* Resume */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Your Resume
              </label>
              <button onClick={loadProfileResume} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                Load from profile
              </button>
            </div>
            <textarea
              rows={14}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your full resume here…

The AI will:
• Rewrite your summary to match the JD
• Add 1–2 targeted bullets per relevant role (max 2 roles)
• Highlight missing skills from the JD in your Skills section

Nothing is invented — only surfaced and reframed."
              className="input resize-none font-mono text-xs leading-relaxed"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <button
            onClick={handleRewrite}
            disabled={loading || !resumeText.trim()}
            className="btn-primary w-full py-3 text-base"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Tailoring your resume…' : 'Rewrite Resume'}
          </button>
        </div>

        {/* ── Right: output ─────────────────────────────────────── */}
        <div>
          {!result && !loading && (
            <div className="card p-16 text-center h-full flex flex-col items-center justify-center">
              <FileEdit className="w-14 h-14 text-gray-300 dark:text-gray-700 mb-4" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Tailored sections will appear here</h2>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">
                The AI rewrites only your summary, adds targeted bullets, and flags missing keywords — it never invents experience.
              </p>
            </div>
          )}

          {loading && (
            <div className="card p-16 text-center h-full flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
              <p className="text-gray-500 font-medium">Tailoring your resume…</p>
              <p className="text-xs text-gray-400">Analysing JD, rewriting summary, crafting bullets…</p>
            </div>
          )}

          {result && !loading && (
            <div className="card p-6">
              <ResultsPanel result={result} originalResume={resumeText} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
