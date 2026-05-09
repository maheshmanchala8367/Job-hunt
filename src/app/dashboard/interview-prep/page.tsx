'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Target, Loader2, Sparkles, Mic, MicOff, Send, ChevronDown, ChevronUp,
  Play, Square, RotateCcw, History, TrendingUp, Clock, CheckCircle2,
  AlertCircle, Star, Trophy, Upload,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface Question {
  id: string; question: string; type: string; difficulty: string;
  hint?: string; framework?: string;
}

interface Feedback {
  score: number; clarity: string; specificity: string;
  strengths: string[]; improvements: string[]; modelAnswer: string;
  starAnalysis?: {
    situation: STARItem; task: STARItem; action: STARItem; result: STARItem;
  };
}

interface STARItem { present: boolean; quality: string; feedback: string }

interface SessionHistory {
  id: string; interviewType: string; role?: string; company?: string;
  avgScore?: number; createdAt: string; completedAt?: string;
}

const INTERVIEW_TYPES = [
  { value: 'behavioral', label: 'Behavioral', desc: 'STAR method, soft skills', color: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' },
  { value: 'technical_software', label: 'Technical (Software)', desc: 'Coding, system design', color: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' },
  { value: 'technical_data', label: 'Technical (Data)', desc: 'SQL, analytics, ML', color: 'bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300' },
  { value: 'product', label: 'Product Sense', desc: 'PM frameworks, roadmap', color: 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300' },
  { value: 'case', label: 'Case Study', desc: 'Business problem solving', color: 'bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300' },
  { value: 'system_design', label: 'System Design', desc: 'Architecture, scalability', color: 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300' },
];

const DIFFICULTIES = [
  { value: 'entry', label: 'Entry' },
  { value: 'mid', label: 'Mid' },
  { value: 'senior', label: 'Senior' },
];

const DIFF_COLOR: Record<string, string> = {
  easy: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  medium: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  hard: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
};

// ── Feedback Panel ─────────────────────────────────────────────────────────────

function FeedbackPanel({ feedback, onRetry, onNext }: { feedback: Feedback; onRetry: () => void; onNext: () => void }) {
  const scoreColor = feedback.score >= 8 ? 'text-green-600' : feedback.score >= 6 ? 'text-amber-600' : 'text-red-600';

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Score */}
      <div className="flex items-center gap-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <div className={`text-4xl font-extrabold ${scoreColor}`}>{feedback.score}</div>
          <div className="text-xs text-gray-400">/ 10</div>
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Clarity:</span>
            <span className="font-medium capitalize text-gray-900 dark:text-white">{feedback.clarity}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500">Specificity:</span>
            <span className="font-medium capitalize text-gray-900 dark:text-white">{feedback.specificity}</span>
          </div>
        </div>
      </div>

      {/* STAR analysis */}
      {feedback.starAnalysis && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">STAR Analysis</p>
          {(['situation', 'task', 'action', 'result'] as const).map((key) => {
            const item = feedback.starAnalysis![key];
            return (
              <div key={key} className={cn('p-3 rounded-xl flex items-start gap-3', item.present ? 'bg-green-50 dark:bg-green-950' : 'bg-red-50 dark:bg-red-950')}>
                {item.present ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">{key}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.feedback}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Strengths</p>
          {feedback.strengths.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1.5">
              <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" /> {s}
            </div>
          ))}
        </div>
      )}

      {/* Improvements */}
      {feedback.improvements.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Improve</p>
          {feedback.improvements.map((s, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300 mb-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" /> {s}
            </div>
          ))}
        </div>
      )}

      {/* Model answer */}
      <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 dark:border-indigo-800">
        <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2">Model Answer</p>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{feedback.modelAnswer}</p>
      </div>

      <div className="flex gap-3 pt-2">
        <button onClick={onRetry} className="btn-secondary flex-1 gap-2"><RotateCcw className="w-4 h-4" /> Try Again</button>
        <button onClick={onNext} className="btn-primary flex-1 gap-2"><Play className="w-4 h-4" /> Next Question</button>
      </div>
    </div>
  );
}

// ── Practice Mode ──────────────────────────────────────────────────────────────

function PracticeMode({
  questions, sessionId, role, onComplete,
}: {
  questions: Question[];
  sessionId: string;
  role?: string;
  onComplete: (avgScore: number) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [listening, setListening] = useState(false);
  const [answered, setAnswered] = useState<{ q: Question; answer: string; feedback: Feedback }[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [idx]);

  const resetTimer = useCallback(() => {
    setElapsed(0);
  }, []);

  function toggleVoice() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition is not supported in this browser.'); return; }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join(' ');
      setAnswer((prev) => (prev ? prev + ' ' + transcript : transcript).trim());
    };
    rec.onend = () => setListening(false);
    rec.start();
    recognitionRef.current = rec;
    setListening(true);
  }

  async function handleSubmit() {
    if (!answer.trim()) return;
    setLoading(true);
    const res = await fetch('/api/interview-prep/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: questions[idx].question, answer, questionType: questions[idx].type, role }),
    });
    const fb = await res.json();
    setLoading(false);
    if (!res.ok) { alert(fb.error || 'Feedback failed.'); return; }
    setFeedback(fb);
  }

  async function handleNext() {
    if (feedback) setAnswered((prev) => [...prev, { q: questions[idx], answer, feedback: feedback! }]);
    setFeedback(null);
    setAnswer('');
    resetTimer();

    if (idx + 1 >= questions.length) {
      const scores = [...answered.map((a) => a.feedback.score), ...(feedback ? [feedback.score] : [])];
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      onComplete(avg);
    } else {
      setIdx((i) => i + 1);
    }
  }

  const q = questions[idx];
  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  const progress = ((idx) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">Question {idx + 1} of {questions.length}</span>
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      {/* Question */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', DIFF_COLOR[q.difficulty])}>{q.difficulty}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 capitalize">{q.type}</span>
          {q.framework && <span className="text-xs text-gray-400">Use {q.framework}</span>}
        </div>
        <p className="text-lg font-semibold text-gray-900 dark:text-white leading-snug mb-3">{q.question}</p>
        {q.hint && (
          <p className="text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 rounded-lg px-3 py-2">
            💡 {q.hint}
          </p>
        )}
      </div>

      {/* Answer + Feedback */}
      {!feedback ? (
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <label className="label mb-0 text-sm">Your Answer</label>
            <button
              onClick={toggleVoice}
              className={cn('flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-colors',
                listening ? 'bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {listening ? <><MicOff className="w-3.5 h-3.5" /> Stop recording</> : <><Mic className="w-3.5 h-3.5" /> Voice input</>}
            </button>
          </div>
          {listening && (
            <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Recording… speak your answer
            </div>
          )}
          <textarea
            rows={8}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type or speak your answer here…"
            className="input resize-none"
          />
          <button onClick={handleSubmit} disabled={loading || !answer.trim()} className="btn-primary w-full py-3">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {loading ? 'Getting AI feedback…' : 'Submit Answer'}
          </button>
        </div>
      ) : (
        <div className="card p-6">
          <FeedbackPanel feedback={feedback} onRetry={() => { setFeedback(null); setAnswer(''); }} onNext={handleNext} />
        </div>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function InterviewPrepPage() {
  const [view, setView] = useState<'setup' | 'practice' | 'history' | 'complete'>('setup');

  // Setup form
  const [interviewType, setInterviewType] = useState('behavioral');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [difficulty, setDifficulty] = useState('mid');
  const [questionCount, setQuestionCount] = useState(5);
  const [jobDesc, setJobDesc] = useState('');
  const [questionTypes, setQuestionTypes] = useState<string[]>(['behavioral', 'situational']);
  const [isMock, setIsMock] = useState(false);

  // Session
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState('');

  // History
  const [history, setHistory] = useState<SessionHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [stats, setStats] = useState<{ total: number; today: number; thisWeek: number; avgByType: Record<string, number> } | null>(null);

  // Completion
  const [finalScore, setFinalScore] = useState(0);

  async function loadHistory() {
    setHistoryLoading(true);
    const [hRes, sRes] = await Promise.all([
      fetch('/api/interview-prep/sessions'),
      fetch('/api/interview-prep/stats'),
    ]);
    setHistory(await hRes.json());
    setStats(await sRes.json());
    setHistoryLoading(false);
  }

  async function handleStart() {
    setGenerating(true);
    setGenError('');

    // Create session record
    const sRes = await fetch('/api/interview-prep/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewType, role, company, difficulty, isMock }),
    });
    const sess = await sRes.json();
    setSessionId(sess.id);

    // Generate questions
    const qRes = await fetch('/api/interview-prep/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ interviewType, role, company, difficulty, count: questionCount, jobDescription: jobDesc, questionTypes }),
    });
    const qData = await qRes.json();
    setGenerating(false);

    if (!qRes.ok) { setGenError(qData.error || 'Failed to generate questions.'); return; }
    setQuestions(qData.questions || []);
    setView('practice');
  }

  async function handleComplete(avg: number) {
    setFinalScore(avg);
    // Save completion
    if (sessionId) {
      await fetch(`/api/interview-prep/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avgScore: avg, completedAt: new Date().toISOString() }),
      });
    }
    setView('complete');
  }

  const TypeCard = ({ t }: { t: typeof INTERVIEW_TYPES[number] }) => (
    <button
      onClick={() => setInterviewType(t.value)}
      className={cn(
        'p-4 rounded-xl border-2 text-left transition-all',
        interviewType === t.value
          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      )}
    >
      <p className={cn('text-sm font-semibold mb-0.5', interviewType === t.value ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-900 dark:text-gray-100')}>{t.label}</p>
      <p className="text-xs text-gray-500">{t.desc}</p>
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Interview Prep</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">AI-generated questions, voice input, and instant feedback.</p>
        </div>
        <div className="flex gap-2">
          {view !== 'setup' && view !== 'complete' && (
            <button onClick={() => setView('setup')} className="btn-secondary text-sm py-2">← New Session</button>
          )}
          <button onClick={() => { setView('history'); loadHistory(); }} className={cn('btn-secondary text-sm py-2 gap-1.5', view === 'history' ? 'bg-indigo-50 dark:bg-indigo-950 border-indigo-300 text-indigo-700 dark:text-indigo-300' : '')}>
            <History className="w-4 h-4" /> History
          </button>
        </div>
      </div>

      {/* ── Setup ───────────────────────────────────────────────── */}
      {view === 'setup' && (
        <div className="max-w-2xl space-y-6">
          <div className="card p-6 space-y-5">
            {/* Interview type */}
            <div>
              <label className="label">Interview Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INTERVIEW_TYPES.map((t) => <TypeCard key={t.value} t={t} />)}
              </div>
            </div>

            {/* Role + Company */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Target Role</label>
                <input className="input" value={role} onChange={(e) => setRole(e.target.value)} placeholder="Software Engineer" />
              </div>
              <div>
                <label className="label">Company (optional)</label>
                <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Google, Amazon…" />
              </div>
            </div>

            {/* Difficulty + Count */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button key={d.value} onClick={() => setDifficulty(d.value)}
                      className={cn('flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all', difficulty === d.value ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400')}>
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Questions: {questionCount}</label>
                <input type="range" min={3} max={20} value={questionCount} onChange={(e) => setQuestionCount(Number(e.target.value))} className="w-full mt-2 accent-indigo-600" />
                <div className="flex justify-between text-xs text-gray-400 mt-1"><span>3</span><span>20</span></div>
              </div>
            </div>

            {/* Job description */}
            <div>
              <label className="label">Job Description (optional — improves tailoring)</label>
              <textarea rows={3} value={jobDesc} onChange={(e) => setJobDesc(e.target.value)} placeholder="Paste the job description to get role-specific questions…" className="input resize-none text-xs" />
            </div>

            {/* Mock mode */}
            <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors">
              <input type="checkbox" checked={isMock} onChange={(e) => setIsMock(e.target.checked)} className="mt-0.5 w-4 h-4 accent-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Mock Interview Mode</p>
                <p className="text-xs text-gray-500">No feedback until all questions are answered. Simulates a real interview.</p>
              </div>
            </label>

            {genError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" /> {genError}
              </div>
            )}

            <button onClick={handleStart} disabled={generating} className="btn-primary w-full py-3 text-base">
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {generating ? 'Generating questions…' : 'Start Session'}
            </button>
          </div>
        </div>
      )}

      {/* ── Practice ─────────────────────────────────────────────── */}
      {view === 'practice' && (
        <PracticeMode questions={questions} sessionId={sessionId} role={role} onComplete={handleComplete} />
      )}

      {/* ── Complete ─────────────────────────────────────────────── */}
      {view === 'complete' && (
        <div className="max-w-md mx-auto text-center card p-10">
          <Trophy className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Session Complete! 🎉</h2>
          <p className="text-gray-500 mb-6">You answered {questionCount} questions.</p>
          <div className="text-5xl font-extrabold mb-1" style={{ color: finalScore >= 8 ? '#10b981' : finalScore >= 6 ? '#f59e0b' : '#ef4444' }}>
            {finalScore}<span className="text-xl text-gray-400">/10</span>
          </div>
          <p className="text-gray-500 text-sm mb-8">Average score across all answers</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => setView('setup')} className="btn-primary w-full">Practice Again</button>
            <button onClick={() => { setView('history'); loadHistory(); }} className="btn-secondary w-full">View History</button>
          </div>
        </div>
      )}

      {/* ── History ──────────────────────────────────────────────── */}
      {view === 'history' && (
        <div className="space-y-6">
          {/* Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Total sessions', value: stats.total },
                { label: 'Today', value: stats.today },
                { label: 'This week', value: stats.thisWeek },
                { label: 'Best category', value: Object.keys(stats.avgByType).length ? Object.keys(stats.avgByType).reduce((a, b) => stats.avgByType[a] > stats.avgByType[b] ? a : b, '') : '—' },
              ].map((s) => (
                <div key={s.label} className="card p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                  <div className="text-xs text-gray-500 mt-1 capitalize">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {historyLoading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
          ) : history.length === 0 ? (
            <div className="card p-12 text-center">
              <Target className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-700 mb-4" />
              <p className="text-gray-500">No completed sessions yet. Start a practice session to see your history here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((h) => (
                <div key={h.id} className="card p-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center shrink-0">
                    <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white capitalize">{h.interviewType.replace('_', ' ')} Interview</p>
                    <p className="text-sm text-gray-500">{h.role ? `${h.role}${h.company ? ` at ${h.company}` : ''}` : 'No role specified'}</p>
                    <p className="text-xs text-gray-400">{formatDate(h.createdAt)}</p>
                  </div>
                  {h.avgScore !== undefined && h.avgScore !== null && (
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold" style={{ color: h.avgScore >= 8 ? '#10b981' : h.avgScore >= 6 ? '#f59e0b' : '#ef4444' }}>
                        {h.avgScore}
                      </div>
                      <div className="text-xs text-gray-400">avg score</div>
                    </div>
                  )}
                  {!h.completedAt && <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">In progress</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
