'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Briefcase, Plus, Search, Filter, Download, Upload, MoreHorizontal,
  ExternalLink, Trash2, Edit3, ChevronDown, ChevronUp, Bell, X,
  CheckSquare, Square, Calendar, Phone, Code, Users, Building2,
  Loader2, AlertCircle, TrendingUp, Trophy, XCircle,
} from 'lucide-react';
import { cn, formatDate, relativeTime } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────

interface InterviewRound {
  id: string; date: string; type: string; interviewers?: string;
  notes?: string; outcome?: string;
}

interface Application {
  id: string; company: string; role: string; location?: string;
  locationType?: string; status: string; url?: string; notes?: string;
  salary?: string; source?: string; recruiterName?: string; recruiterContact?: string;
  followUpDate?: string; appliedAt: string; updatedAt: string;
  interviewRounds: InterviewRound[];
}

interface Stats {
  total: number; activeInterviews: number; offers: number; rejected: number;
  statusCounts: Record<string, number>; sourceCounts: Record<string, number>;
  weeklyData: { week: string; count: number }[];
  followUps: { id: string; company: string; role: string; status: string; followUpDate: string }[];
}

// ── Constants ──────────────────────────────────────────────────────────────────

const STATUSES = [
  { value: 'saved', label: 'Saved', color: '#6b7280' },
  { value: 'applied', label: 'Applied', color: '#3b82f6' },
  { value: 'phone_screen', label: 'Phone Screen', color: '#8b5cf6' },
  { value: 'interviewing', label: 'Interviewing', color: '#f59e0b' },
  { value: 'offer', label: 'Offer', color: '#10b981' },
  { value: 'rejected', label: 'Rejected', color: '#ef4444' },
  { value: 'withdrawn', label: 'Withdrawn', color: '#9ca3af' },
];

const STATUS_LABEL: Record<string, string> = Object.fromEntries(STATUSES.map((s) => [s.value, s.label]));
const STATUS_COLOR: Record<string, string> = Object.fromEntries(STATUSES.map((s) => [s.value, s.color]));

const STATUS_BADGE: Record<string, string> = {
  saved: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
  applied: 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  phone_screen: 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  interviewing: 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300',
  offer: 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  rejected: 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300',
  withdrawn: 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500',
};

const SOURCES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'company_site', label: 'Company Site' },
  { value: 'job_board', label: 'Job Board' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'other', label: 'Other' },
];

const ROUND_TYPES = [
  { value: 'phone', label: 'Phone Screen', icon: Phone },
  { value: 'technical', label: 'Technical', icon: Code },
  { value: 'behavioral', label: 'Behavioral', icon: Users },
  { value: 'hiring_manager', label: 'Hiring Manager', icon: Building2 },
  { value: 'onsite', label: 'Onsite', icon: Building2 },
  { value: 'system_design', label: 'System Design', icon: Code },
  { value: 'final', label: 'Final Round', icon: Trophy },
];

// ── Application Modal ──────────────────────────────────────────────────────────

function ApplicationModal({
  app, onClose, onSave,
}: {
  app: Partial<Application> | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const isEdit = !!app?.id;
  const [form, setForm] = useState({
    company: app?.company || '',
    role: app?.role || '',
    location: app?.location || '',
    locationType: app?.locationType || 'onsite',
    status: app?.status || 'applied',
    url: app?.url || '',
    salary: app?.salary || '',
    source: app?.source || '',
    recruiterName: app?.recruiterName || '',
    recruiterContact: app?.recruiterContact || '',
    followUpDate: app?.followUpDate ? app.followUpDate.split('T')[0] : '',
    notes: app?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [rounds, setRounds] = useState<InterviewRound[]>(app?.interviewRounds || []);
  const [newRound, setNewRound] = useState({ date: '', type: 'phone', interviewers: '', notes: '', outcome: 'pending' });
  const [addingRound, setAddingRound] = useState(false);

  function set(field: string, value: string) {
    setForm((f: typeof form) => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    if (!form.company || !form.role) { setError('Company and role are required.'); return; }
    setSaving(true);
    setError('');
    const method = isEdit ? 'PUT' : 'POST';
    const url = isEdit ? `/api/job-tracker/${app!.id}` : '/api/job-tracker';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) { onSave(); onClose(); }
    else setError((await res.json()).error || 'Failed to save.');
  }

  async function handleAddRound() {
    if (!newRound.date) return;
    const res = await fetch(`/api/job-tracker/${app!.id}/rounds`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRound),
    });
    if (res.ok) {
      const round = await res.json();
      setRounds((prev: InterviewRound[]) => [...prev, round as InterviewRound]);
      setNewRound({ date: '', type: 'phone', interviewers: '', notes: '', outcome: 'pending' });
      setAddingRound(false);
    }
  }

  async function handleDeleteRound(roundId: string) {
    const res = await fetch(`/api/job-tracker/${app!.id}/rounds`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roundId }),
    });
    if (res.ok) setRounds((prev: InterviewRound[]) => prev.filter((r: InterviewRound) => r.id !== roundId));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{isEdit ? 'Edit Application' : 'Add Application'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-4">
          {error && <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 text-sm border border-red-200 dark:border-red-800"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Company *</label>
              <input className="input" value={form.company} onChange={(e) => set('company', e.target.value)} placeholder="Acme Corp" />
            </div>
            <div>
              <label className="label">Position *</label>
              <input className="input" value={form.role} onChange={(e) => set('role', e.target.value)} placeholder="Software Engineer" />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="input" value={form.status} onChange={(e) => set('status', e.target.value)}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location Type</label>
              <select className="input" value={form.locationType} onChange={(e) => set('locationType', e.target.value)}>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" value={form.location} onChange={(e) => set('location', e.target.value)} placeholder="New York, NY" />
            </div>
            <div>
              <label className="label">Salary Range</label>
              <input className="input" value={form.salary} onChange={(e) => set('salary', e.target.value)} placeholder="$120k–$150k" />
            </div>
            <div>
              <label className="label">Job Link</label>
              <input className="input" value={form.url} onChange={(e) => set('url', e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <label className="label">Source</label>
              <select className="input" value={form.source} onChange={(e) => set('source', e.target.value)}>
                <option value="">Select source</option>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Recruiter Name</label>
              <input className="input" value={form.recruiterName} onChange={(e) => set('recruiterName', e.target.value)} placeholder="Jane Smith" />
            </div>
            <div>
              <label className="label">Recruiter Contact</label>
              <input className="input" value={form.recruiterContact} onChange={(e) => set('recruiterContact', e.target.value)} placeholder="jane@company.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Follow-up reminder date</label>
              <input type="date" className="input" value={form.followUpDate} onChange={(e) => set('followUpDate', e.target.value)} />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea rows={4} className="input resize-none" value={form.notes} onChange={(e) => set('notes', e.target.value)} placeholder="Notes, observations, key contacts…" />
          </div>

          {/* Interview rounds — only show when editing */}
          {isEdit && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm">Interview Rounds</h3>
                <button onClick={() => setAddingRound(true)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add round
                </button>
              </div>

              {rounds.length === 0 && !addingRound && (
                <p className="text-xs text-gray-400 italic">No interview rounds logged yet.</p>
              )}

              {rounds.map((r, i) => (
                <div key={r.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Round {i + 1}: {ROUND_TYPES.find(t => t.value === r.type)?.label || r.type}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded-full', r.outcome === 'passed' ? 'bg-green-100 text-green-700' : r.outcome === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500')}>
                        {r.outcome || 'pending'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(r.date)}{r.interviewers && ` · ${r.interviewers}`}</p>
                    {r.notes && <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{r.notes}</p>}
                  </div>
                  <button onClick={() => handleDeleteRound(r.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {addingRound && (
                <div className="p-3 rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label text-xs">Date</label>
                      <input type="date" className="input text-xs" value={newRound.date} onChange={(e) => setNewRound((r: typeof newRound) => ({ ...r, date: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label text-xs">Type</label>
                      <select className="input text-xs" value={newRound.type} onChange={(e) => setNewRound((r: typeof newRound) => ({ ...r, type: e.target.value }))}>
                        {ROUND_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="label text-xs">Interviewers</label>
                      <input className="input text-xs" placeholder="Names or roles" value={newRound.interviewers} onChange={(e) => setNewRound((r: typeof newRound) => ({ ...r, interviewers: e.target.value }))} />
                    </div>
                    <div>
                      <label className="label text-xs">Outcome</label>
                      <select className="input text-xs" value={newRound.outcome} onChange={(e) => setNewRound((r: typeof newRound) => ({ ...r, outcome: e.target.value }))}>
                        <option value="pending">Pending</option>
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="label text-xs">Notes</label>
                      <textarea rows={2} className="input text-xs resize-none" placeholder="Topics covered, questions asked…" value={newRound.notes} onChange={(e) => setNewRound((r: typeof newRound) => ({ ...r, notes: e.target.value }))} />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setAddingRound(false)} className="btn-secondary text-xs py-1.5 flex-1">Cancel</button>
                    <button onClick={handleAddRound} className="btn-primary text-xs py-1.5 flex-1">Save Round</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Application'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function JobTrackerPage() {
  const [view, setView] = useState<'dashboard' | 'table'>('table');
  const [apps, setApps] = useState<Application[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sortBy, setSortBy] = useState('appliedAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Modal
  const [modalApp, setModalApp] = useState<Partial<Application> | null | false>(false);

  // Import
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState('');

  const fetchApps = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ sortBy, sortDir });
    if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);
    if (sourceFilter) params.set('source', sourceFilter);
    if (search) params.set('q', search);
    const res = await fetch(`/api/job-tracker?${params}`);
    const data = await res.json();
    setApps(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [search, statusFilter, sourceFilter, sortBy, sortDir]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    const res = await fetch('/api/job-tracker/stats');
    const data = await res.json();
    setStats(data);
    setStatsLoading(false);
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  function toggleSort(field: string) {
    if (sortBy === field) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortDir('asc'); }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  function toggleSelectAll() {
    setSelected((prev) => prev.size === apps.length ? new Set() : new Set(apps.map((a) => a.id)));
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/job-tracker/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    setApps((prev) => prev.map((a) => a.id === id ? { ...a, status } : a));
    fetchStats();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this application?')) return;
    await fetch(`/api/job-tracker/${id}`, { method: 'DELETE' });
    setApps((prev) => prev.filter((a) => a.id !== id));
    fetchStats();
  }

  async function handleBulkDelete() {
    if (!confirm(`Delete ${selected.size} applications?`)) return;
    await Promise.all(Array.from(selected).map((id) => fetch(`/api/job-tracker/${id}`, { method: 'DELETE' })));
    setApps((prev) => prev.filter((a) => !selected.has(a.id)));
    setSelected(new Set());
    fetchStats();
  }

  async function handleBulkStatus(status: string) {
    await Promise.all(Array.from(selected).map((id) =>
      fetch(`/api/job-tracker/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    ));
    setApps((prev) => prev.map((a) => selected.has(a.id) ? { ...a, status } : a));
    setSelected(new Set());
    fetchStats();
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    setImportMsg('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/job-tracker/import', { method: 'POST', body: fd });
    const data = await res.json();
    setImportMsg(`Imported ${data.imported} applications${data.skipped ? ` (${data.skipped} skipped)` : ''}.`);
    setImporting(false);
    fetchApps(); fetchStats();
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const SortIcon = ({ field }: { field: string }) =>
    sortBy === field ? (
      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
    ) : null;

  const statusChartData = STATUSES.map((s) => ({
    name: s.label,
    value: stats?.statusCounts[s.value] ?? 0,
    color: s.color,
  })).filter((d) => d.value > 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Job Tracker</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track every application from saved to offer.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <button onClick={() => setView('dashboard')} className={cn('px-3 py-2 text-sm font-medium transition-colors', view === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>Dashboard</button>
            <button onClick={() => setView('table')} className={cn('px-3 py-2 text-sm font-medium transition-colors', view === 'table' ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800')}>Table</button>
          </div>

          {/* Import */}
          <button onClick={() => fileInputRef.current?.click()} disabled={importing} className="btn-secondary text-sm py-2">
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Import CSV
          </button>
          <input ref={fileInputRef} type="file" accept=".csv" className="hidden" onChange={handleImport} />

          {/* Template download */}
          <a href="/api/job-tracker/export" className="btn-secondary text-sm py-2" title="Download CSV template (OPTIONS)">
            <Download className="w-4 h-4" /> Export CSV
          </a>

          <button onClick={() => setModalApp({})} className="btn-primary text-sm py-2">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {importMsg && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {importMsg}
        </div>
      )}

      {/* ── Dashboard View ─────────────────────────────────────── */}
      {view === 'dashboard' && (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Applied', value: stats?.total ?? 0, icon: Briefcase, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950' },
              { label: 'Active Interviews', value: stats?.activeInterviews ?? 0, icon: Calendar, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950' },
              { label: 'Offers', value: stats?.offers ?? 0, icon: Trophy, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950' },
              { label: 'Rejected', value: stats?.rejected ?? 0, icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950' },
            ].map((s) => (
              <div key={s.label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statsLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-400" /> : s.value}
                </div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Bar: by status */}
            <div className="card p-5 lg:col-span-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Applications by Status</h3>
              {statsLoading ? (
                <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={statusChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {statusChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Pie: distribution */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Status Distribution</h3>
              {statsLoading ? (
                <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" nameKey="name">
                      {statusChartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} />
                    <Legend iconType="circle" iconSize={8} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Line: weekly trend */}
            <div className="card p-5 lg:col-span-3">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4">Applications Over Time (weekly)</h3>
              {statsLoading ? (
                <div className="h-48 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={stats?.weeklyData ?? []} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#6366f1" fill="url(#appGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Follow-ups */}
          {stats?.followUps && stats.followUps.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" /> Needs follow-up this week
              </h3>
              <div className="space-y-3">
                {stats.followUps.map((f) => (
                  <div key={f.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">{f.role} at {f.company}</p>
                      <p className="text-xs text-gray-500">Follow-up by: {formatDate(f.followUpDate)}</p>
                    </div>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', STATUS_BADGE[f.status])}>{STATUS_LABEL[f.status]}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Table View ─────────────────────────────────────────── */}
      {view === 'table' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="card p-4 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search company, role, notes…" value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
              </div>
              <select className="input sm:w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select className="input sm:w-40" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="">All sources</option>
                {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Bulk actions */}
            {selected.size > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-sm text-gray-600 dark:text-gray-400">{selected.size} selected</span>
                <div className="flex gap-2">
                  {STATUSES.map((s) => (
                    <button key={s.value} onClick={() => handleBulkStatus(s.value)} className="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-indigo-400 transition-colors">{s.label}</button>
                  ))}
                </div>
                <button onClick={handleBulkDelete} className="text-xs px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3 h-3 inline mr-1" />Delete
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="p-3 text-left w-10">
                      <button onClick={toggleSelectAll}>
                        {selected.size === apps.length && apps.length > 0 ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-gray-400" />}
                      </button>
                    </th>
                    {[
                      { label: 'Company', field: 'company' },
                      { label: 'Position', field: 'role' },
                      { label: 'Status', field: 'status' },
                      { label: 'Source', field: 'source' },
                      { label: 'Applied', field: 'appliedAt' },
                      { label: 'Follow-up', field: 'followUpDate' },
                    ].map(({ label, field }) => (
                      <th key={field} className="p-3 text-left font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => toggleSort(field)}>
                        <span className="flex items-center gap-1">{label} <SortIcon field={field} /></span>
                      </th>
                    ))}
                    <th className="p-3 w-24"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <tr><td colSpan={8} className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" /></td></tr>
                  ) : apps.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center">
                        <Briefcase className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">No applications found.</p>
                        <button onClick={() => setModalApp({})} className="text-indigo-600 dark:text-indigo-400 text-sm hover:underline mt-2">Add your first application →</button>
                      </td>
                    </tr>
                  ) : apps.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                      <td className="p-3">
                        <button onClick={() => toggleSelect(app.id)}>
                          {selected.has(app.id) ? <CheckSquare className="w-4 h-4 text-indigo-600" /> : <Square className="w-4 h-4 text-gray-300" />}
                        </button>
                      </td>
                      <td className="p-3 font-medium text-gray-900 dark:text-white whitespace-nowrap">{app.company}</td>
                      <td className="p-3 text-gray-600 dark:text-gray-400 max-w-[200px] truncate">{app.role}</td>
                      <td className="p-3">
                        <select
                          value={app.status}
                          onChange={(e) => handleStatusChange(app.id, e.target.value)}
                          className={cn('text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer outline-none', STATUS_BADGE[app.status])}
                        >
                          {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                      </td>
                      <td className="p-3 text-gray-500 whitespace-nowrap capitalize">{app.source?.replace('_', ' ') || '—'}</td>
                      <td className="p-3 text-gray-500 whitespace-nowrap">{relativeTime(app.appliedAt)}</td>
                      <td className="p-3 whitespace-nowrap">
                        {app.followUpDate ? (
                          <span className={cn('text-xs', new Date(app.followUpDate) <= new Date() ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-400')}>
                            {formatDate(app.followUpDate)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1 justify-end">
                          {app.url && (
                            <a href={app.url} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button onClick={() => setModalApp(app)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(app.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-right">{apps.length} application{apps.length !== 1 ? 's' : ''}</p>
        </div>
      )}

      {/* Modal */}
      {modalApp !== false && (
        <ApplicationModal
          app={modalApp}
          onClose={() => setModalApp(false)}
          onSave={() => { fetchApps(); fetchStats(); }}
        />
      )}
    </div>
  );
}
