'use client';

import { useState, useRef, useCallback } from 'react';
import {
  FileSearch, Upload, Loader2, CheckCircle, XCircle, AlertCircle,
  Sparkles, History, X, ExternalLink, ChevronDown, ChevronUp,
  Download, RefreshCw, ArrowRight,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface ATSIssue { issue: string; severity: 'high' | 'medium' | 'low'; suggestion: string }
interface Keyword { keyword: string; whereToAdd: string; howToPhrase: string }
interface BulletSuggestion { original: string; improved: string; reason: string }
interface SkillGap { skill: string; resources: { title: string; url: string; platform: string }[] }

interface Analysis {
  id: string; score: number; createdAt: string;
  atsIssues: ATSIssue[];
  missingKeywords: { high: Keyword[]; medium: Keyword[]; low: Keyword[] };
  bulletSuggestions: BulletSuggestion[];
  skillGaps: SkillGap[];
  strengths: string[];
}

interface HistoryItem {
  id: string; score: number; jobTitle?: string; createdAt: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const SEV_COLOR: Record<string, string> = {
  high: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  medium: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  low: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

function scoreLabel(s: number) {
  if (s >= 75) return { text: 'Strong Match', color: 'text-green-600 dark:text-green-400', ring: '#10b981' };
  if (s >= 50) return { text: 'Moderate Match', color: 'text-amber-600 dark:text-amber-400', ring: '#f59e0b' };
  return { text: 'Weak Match', color: 'text-red-600 dark:text-red-400', ring: '#ef4444' };
}

// ── File Upload Zone ───────────────────────────────────────────────────────────

function FileUploadZone({
  label, onText,
}: {
  label: string;
  onText: (text: string, fileName?: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedName, setUploadedName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    setError('');
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/resume-match/parse', { method: 'POST', body: fd });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error || 'Parse failed.'); return; }
    setUploadedName(file.name);
    onText(data.text, file.name);
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        'border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all',
        dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      {uploading ? (
        <><Loader2 className="w-6 h-6 animate-spin text-indigo-600 mx-auto mb-2" /><p className="text-sm text-gray-500">Parsing file…</p></>
      ) : uploadedName ? (
        <><CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" /><p className="text-sm font-medium text-gray-900 dark:text-white">{uploadedName}</p><p className="text-xs text-gray-400 mt-0.5">Click to replace</p></>
      ) : (
        <><Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-600 dark:text-gray-400"><span className="font-medium text-indigo-600 dark:text-indigo-400">Upload {label}</span> or drag & drop</p><p className="text-xs text-gray-400 mt-1">PDF, DOCX, TXT · max 5 MB</p></>
      )}
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  );
}

// ── Score Gauge ────────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const { text, color, ring } = scoreLabel(score);
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" strokeWidth="10" className="stroke-gray-100 dark:stroke-gray-800" />
          <circle
            cx="50" cy="50" r={r} fill="none" strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" stroke={ring}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${color}`}>{score}</span>
          <span className="text-xs text-gray-400">/ 100</span>
        </div>
      </div>
      <p className={`text-lg font-semibold ${color}`}>{text}</p>
    </div>
  );
}

// ── Results Panel ──────────────────────────────────────────────────────────────

function ResultsPanel({ analysis, onExport }: { analysis: Analysis; onExport: () => void }) {
  const [openSection, setOpenSection] = useState<string | null>('keywords');

  function Section({ id, title, count, children }: { id: string; title: string; count?: number; children: React.ReactNode }) {
    const open = openSection === id;
    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <button
          className="flex items-center justify-between w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          onClick={() => setOpenSection(open ? null : id)}
        >
          <span className="font-medium text-gray-900 dark:text-white text-sm">{title}{count !== undefined && <span className="ml-2 text-xs text-gray-400">({count})</span>}</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>
        {open && <div className="p-4 border-t border-gray-100 dark:border-gray-800">{children}</div>}
      </div>
    );
  }

  const allKeywords = [
    ...analysis.missingKeywords.high.map((k) => ({ ...k, priority: 'high' })),
    ...analysis.missingKeywords.medium.map((k) => ({ ...k, priority: 'medium' })),
    ...analysis.missingKeywords.low.map((k) => ({ ...k, priority: 'low' })),
  ];

  return (
    <div className="space-y-4">
      <ScoreGauge score={analysis.score} />

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Analysed {formatDate(analysis.createdAt)}</p>
        <button onClick={onExport} className="btn-secondary text-xs py-1.5 px-3">
          <Download className="w-3.5 h-3.5" /> Export PDF
        </button>
      </div>

      {/* ATS Issues */}
      {analysis.atsIssues.length > 0 && (
        <Section id="ats" title="ATS Formatting Issues" count={analysis.atsIssues.length}>
          <div className="space-y-2">
            {analysis.atsIssues.map((issue, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0 mt-0.5', SEV_COLOR[issue.severity])}>{issue.severity}</span>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{issue.issue}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{issue.suggestion}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Missing Keywords */}
      <Section id="keywords" title="Missing Keywords" count={allKeywords.length}>
        <div className="space-y-2">
          {allKeywords.map((kw, i) => (
            <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2 mb-1">
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', SEV_COLOR[kw.priority])}>{kw.priority}</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{kw.keyword}</span>
                <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{kw.whereToAdd}</span>
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 italic">"{kw.howToPhrase}"</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Bullet Suggestions */}
      <Section id="bullets" title="Rewritten Bullets" count={analysis.bulletSuggestions.length}>
        <div className="space-y-4">
          {analysis.bulletSuggestions.map((b, i) => (
            <div key={i} className="space-y-2">
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-100 dark:border-red-900">
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Before</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{b.original}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-100 dark:border-green-900">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">After</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{b.improved}</p>
              </div>
              {b.reason && <p className="text-xs text-gray-400 px-1">💡 {b.reason}</p>}
            </div>
          ))}
        </div>
      </Section>

      {/* Skill Gaps */}
      {analysis.skillGaps.length > 0 && (
        <Section id="gaps" title="Skill Gaps + Resources" count={analysis.skillGaps.length}>
          <div className="space-y-4">
            {analysis.skillGaps.map((gap, i) => (
              <div key={i}>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{gap.skill}</p>
                <div className="space-y-1.5 ml-2">
                  {gap.resources.map((r, j) => (
                    <a key={j} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>{r.title}</span>
                      <span className="text-xs text-gray-400">· {r.platform}</span>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Strengths */}
      {analysis.strengths.length > 0 && (
        <Section id="strengths" title="Strengths" count={analysis.strengths.length}>
          <div className="space-y-2">
            {analysis.strengths.map((s, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700 dark:text-gray-300">{s}</p>
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ResumeMatchPage() {
  const [tab, setTab] = useState<'analyse' | 'history'>('analyse');

  // Input state
  const [resumeMode, setResumeMode] = useState<'paste' | 'upload' | 'profile'>('paste');
  const [resumeText, setResumeText] = useState('');
  const [jdMode, setJdMode] = useState<'paste' | 'upload'>('paste');
  const [jobDescription, setJobDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  // History
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<Analysis | null>(null);

  async function loadProfileResume() {
    const res = await fetch('/api/user/profile');
    const data = await res.json();
    if (data.baseResume) { setResumeText(data.baseResume); setResumeMode('profile'); }
    else alert('No base resume saved. Go to Profile to add one.');
  }

  async function loadHistory() {
    setHistoryLoading(true);
    const res = await fetch('/api/resume-match/history');
    const data = await res.json();
    setHistory(Array.isArray(data) ? data : []);
    setHistoryLoading(false);
  }

  async function handleAnalyse() {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);

    const res = await fetch('/api/resume-match/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resumeText, jobDescription, jobTitle }),
    });

    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || 'Analysis failed.'); return; }
    setAnalysis(data);
  }

  function handleExportPDF() {
    if (!analysis) return;
    const content = [
      `Resume Match Analysis Report`,
      `Score: ${analysis.score}/100`,
      `Date: ${formatDate(analysis.createdAt)}`,
      ``,
      `ATS ISSUES:`,
      ...analysis.atsIssues.map((i) => `[${i.severity.toUpperCase()}] ${i.issue}: ${i.suggestion}`),
      ``,
      `MISSING KEYWORDS:`,
      ...[...analysis.missingKeywords.high, ...analysis.missingKeywords.medium, ...analysis.missingKeywords.low]
        .map((k) => `• ${k.keyword} → Add to ${k.whereToAdd}: "${k.howToPhrase}"`),
      ``,
      `STRENGTHS:`,
      ...analysis.strengths.map((s) => `✓ ${s}`),
    ].join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `resume-match-report-${analysis.id}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Resume Match</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Upload or paste your resume and a job description for an instant AI analysis.</p>
        </div>
        <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
          <button onClick={() => setTab('analyse')} className={cn('px-3 py-2 text-sm font-medium', tab === 'analyse' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>Analyse</button>
          <button onClick={() => { setTab('history'); loadHistory(); }} className={cn('px-3 py-2 text-sm font-medium flex items-center gap-1.5', tab === 'history' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>
            <History className="w-3.5 h-3.5" /> History
          </button>
        </div>
      </div>

      {/* ── Analyse Tab ─────────────────────────────────────────── */}
      {tab === 'analyse' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left: inputs */}
          <div className="space-y-4">
            {/* Job title */}
            <div className="card p-5">
              <label className="label">Job Title (optional)</label>
              <input type="text" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Product Manager at Stripe" className="input" />
            </div>

            {/* Job description */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="label mb-0">Job Description</label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-xs">
                  {(['paste', 'upload'] as const).map((m) => (
                    <button key={m} onClick={() => setJdMode(m)} className={cn('px-2.5 py-1 capitalize', jdMode === m ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800')}>
                      {m === 'upload' ? 'Upload file' : 'Paste text'}
                    </button>
                  ))}
                </div>
              </div>
              {jdMode === 'paste' ? (
                <textarea rows={8} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the full job description here…" className="input resize-none" />
              ) : (
                <FileUploadZone label="Job Description" onText={(t) => setJobDescription(t)} />
              )}
            </div>

            {/* Resume */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="label mb-0">Your Resume</label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 text-xs">
                  {(['paste', 'upload', 'profile'] as const).map((m) => (
                    <button key={m} onClick={() => m === 'profile' ? loadProfileResume() : setResumeMode(m)}
                      className={cn('px-2.5 py-1 capitalize', resumeMode === m ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800')}>
                      {m === 'upload' ? 'Upload' : m === 'profile' ? 'From profile' : 'Paste'}
                    </button>
                  ))}
                </div>
              </div>
              {resumeMode === 'upload' ? (
                <FileUploadZone label="Resume" onText={(t, name) => { setResumeText(t); if (name) setUploadedFileName(name); }} />
              ) : (
                <textarea rows={10} value={resumeText} onChange={(e) => setResumeText(e.target.value)} placeholder="Paste your resume text here…" className="input resize-none font-mono text-xs leading-relaxed" />
              )}
              {resumeMode === 'profile' && resumeText && (
                <p className="text-xs text-indigo-500 mt-1">✓ Loaded from your profile resume</p>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <button onClick={handleAnalyse} disabled={loading || !resumeText.trim() || !jobDescription.trim()} className="btn-primary w-full py-3">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Analysing your resume…' : 'Analyse Match'}
            </button>
          </div>

          {/* Right: results */}
          <div>
            {!analysis && !loading && (
              <div className="card p-16 text-center h-full flex flex-col items-center justify-center">
                <FileSearch className="w-14 h-14 text-gray-300 dark:text-gray-700 mb-4" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Results will appear here</h2>
                <p className="text-gray-500 text-sm max-w-xs">Fill in the job description and resume on the left, then click Analyse Match.</p>
              </div>
            )}
            {loading && (
              <div className="card p-16 text-center h-full flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                <p className="text-gray-500 font-medium">Running AI analysis…</p>
                <p className="text-xs text-gray-400">Checking ATS compatibility, extracting keywords, generating suggestions…</p>
              </div>
            )}
            {analysis && !loading && (
              <div className="card p-6">
                <ResultsPanel analysis={analysis} onExport={handleExportPDF} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── History Tab ─────────────────────────────────────────── */}
      {tab === 'history' && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Past Analyses</h2>
            {historyLoading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : history.length === 0 ? (
              <div className="card p-8 text-center"><p className="text-gray-400 text-sm">No analyses yet.</p></div>
            ) : history.map((h) => {
              const { color } = scoreLabel(h.score);
              return (
                <button
                  key={h.id}
                  onClick={async () => {
                    const res = await fetch('/api/resume-match/history');
                    const all = await res.json();
                    setSelectedHistory(all.find((a: Analysis) => a.id === h.id) || null);
                  }}
                  className={cn('card w-full p-4 text-left hover:shadow-md transition-all', selectedHistory?.id === h.id ? 'ring-2 ring-indigo-500' : '')}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-2xl font-bold ${color}`}>{h.score}</span>
                    <span className="text-xs text-gray-400">{formatDate(h.createdAt)}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{h.jobTitle || 'Untitled analysis'}</p>
                </button>
              );
            })}
          </div>

          <div className="lg:col-span-2">
            {selectedHistory ? (
              <div className="card p-6">
                <ResultsPanel analysis={selectedHistory} onExport={() => {}} />
              </div>
            ) : (
              <div className="card p-16 text-center h-full flex flex-col items-center justify-center">
                <History className="w-12 h-12 text-gray-300 dark:text-gray-700 mb-4" />
                <p className="text-gray-500 text-sm">Select an analysis from the list to view details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
