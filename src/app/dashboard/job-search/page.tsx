'use client';

import { useState, useEffect, useRef, FormEvent, useCallback } from 'react';
import {
  Search, MapPin, Clock, ExternalLink, Bookmark,
  Loader2, AlertCircle, CheckCircle2, X, Globe,
} from 'lucide-react';
import { cn, relativeTime } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Job {
  id: string; title: string; company: string; location: string;
  url: string; source: string; sourceCategory: string;
  postedAt: string | null; salary?: string; jobType?: string;
  remote?: boolean; tags?: string[];
}
interface SourceResult { sourceId: string; sourceName: string; jobs: Job[]; error?: string }
interface SearchResult {
  jobs: Job[]; sources: SourceResult[];
  totalCount: number; filteredCount: number;
}

// ── Constants ──────────────────────────────────────────────────────────────────
const JOB_TITLES = [
  'Software Engineer','Senior Software Engineer','Staff Software Engineer',
  'Frontend Engineer','Backend Engineer','Full Stack Engineer',
  'AI Engineer','ML Engineer','Machine Learning Engineer',
  'Data Scientist','Senior Data Scientist','Data Engineer','Data Analyst',
  'Product Manager','Senior Product Manager','Product Designer','UX Designer',
  'DevOps Engineer','Platform Engineer','Site Reliability Engineer','Cloud Engineer',
  'Engineering Manager','Director of Engineering','VP of Engineering',
  'iOS Engineer','Android Engineer','Mobile Engineer',
  'Security Engineer','QA Engineer','Solutions Architect',
  'Business Analyst','Marketing Manager','Growth Manager',
  'Account Executive','Sales Engineer','Customer Success Manager',
];

const LOCATIONS = [
  'United States','Remote','New York, NY','San Francisco, CA',
  'Seattle, WA','Austin, TX','Boston, MA','Chicago, IL',
  'Los Angeles, CA','Denver, CO','Atlanta, GA','Miami, FL',
  'London, UK','Toronto, Canada','Berlin, Germany','Singapore',
  'India','Bengaluru, India','Mumbai, India','Hyderabad, India',
  'Delhi, India','Pune, India','Chennai, India','Noida, India',
  'Australia','Dubai, UAE','Netherlands',
];

const TIME_FILTERS = [
  { label: 'All time', value: undefined },
  { label: 'Last 4h',  value: 4   },
  { label: 'Last 8h',  value: 8   },
  { label: 'Last 12h', value: 12  },
  { label: 'Last 24h', value: 24  },
  { label: 'Last week',value: 168 },
] as const;

// Sources that auto-fetch without needing company slugs
const ALL_PUBLIC_SOURCES = [
  // JSON APIs
  'remotive', 'remoteok', 'himalayas',
  // Global job boards
  'indeed', 'linkedin', 'glassdoor', 'dice',
  'weworkremotely', 'yc', 'wellfound', 'builtin', 'remoterocketship',
  // India job boards
  'naukri', 'foundit', 'internshala', 'monster', 'apna', 'cutshort', 'shine',
  // ATS boards with built-in seed lists
  'greenhouse', 'lever', 'ashby', 'workable', 'breezyhr',
  'recruitee', 'smartrecruiters', 'jazzhr', 'teamtailor',
  'pinpoint', 'homerun',
];

const SOURCE_NAMES: Record<string, string> = {
  remotive: 'Remotive', remoteok: 'Remote OK', himalayas: 'Himalayas',
  indeed: 'Indeed', dice: 'Dice', naukri: 'Naukri', foundit: 'Foundit',
  internshala: 'Internshala', monster: 'Monster India', apna: 'Apna',
  cutshort: 'CutShort', shine: 'Shine',
  weworkremotely: 'We Work Remotely', yc: 'Y Combinator', wellfound: 'Wellfound',
  builtin: 'Builtin', remoterocketship: 'Remote Rocketship',
  linkedin: 'LinkedIn', glassdoor: 'Glassdoor',
  greenhouse: 'Greenhouse', lever: 'Lever', ashby: 'Ashby', workable: 'Workable',
  breezyhr: 'BreezyHR', recruitee: 'Recruitee', smartrecruiters: 'SmartRecruiters',
  jazzhr: 'JazzHR', teamtailor: 'Teamtailor', pinpoint: 'Pinpoint', homerun: 'Homerun',
};

const categoryBadge: Record<string, string> = {
  api:     'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300',
  board:   'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300',
  ats:     'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300',
  generic: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

// ── Autocomplete Input ─────────────────────────────────────────────────────────
function AutoInput({
  value, onChange, onSelect, suggestions, placeholder,
  icon: Icon, className = '',
}: {
  value: string; onChange: (v: string) => void; onSelect: (v: string) => void;
  suggestions: string[]; placeholder: string;
  icon: React.ComponentType<{ className?: string }>; className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const filtered = value.length >= 1
    ? suggestions.filter((s) => s.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className={cn('relative flex-1', className)}>
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text" value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="input pl-10 pr-8 w-full"
      />
      {value && (
        <button onClick={() => { onChange(''); setOpen(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X className="w-3.5 h-3.5" />
        </button>
      )}
      {open && filtered.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((s) => (
            <li key={s}>
              <button type="button"
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950 hover:text-indigo-700 transition-colors"
                onMouseDown={(e) => { e.preventDefault(); onSelect(s); setOpen(false); }}>
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function JobSearchPage() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [sinceHours, setSinceHours] = useState<number | undefined>(undefined);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const doSearch = useCallback(async (q: string, loc: string, since?: number) => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams();
    if (q.trim()) params.set('q', q.trim());
    else params.set('q', '');          // empty = latest listings
    if (loc.trim()) params.set('location', loc.trim());
    if (since) params.set('since', String(since));
    // always use all public sources; no sources param = orchestrator uses all
    params.set('sources', ALL_PUBLIC_SOURCES.join(','));

    try {
      const res = await fetch(`/api/jobs/search?${params}`);
      if (!res.ok) throw new Error((await res.json()).error || `Error ${res.status}`);
      setResult(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch latest jobs on page load
  useEffect(() => {
    doSearch('', '', undefined);
  }, [doSearch]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    doSearch(query, location, sinceHours);
  }

  const saveJob = (id: string) => setSaved((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Job Search</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Live listings from {ALL_PUBLIC_SOURCES.length} sources · auto-loading latest jobs.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit} className="card p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <AutoInput
            value={query} onChange={setQuery} onSelect={(v) => { setQuery(v); doSearch(v, location, sinceHours); }}
            suggestions={JOB_TITLES} placeholder="Job title or keyword…" icon={Search}
          />
          <AutoInput
            value={location} onChange={setLocation} onSelect={(v) => { setLocation(v); doSearch(query, v, sinceHours); }}
            suggestions={LOCATIONS} placeholder="Location or Remote…" icon={MapPin}
            className="sm:max-w-[200px]"
          />
          <button type="submit" disabled={loading} className="btn-primary sm:w-28 shrink-0">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? 'Loading' : 'Search'}
          </button>
        </div>

        {/* Time filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400 shrink-0" />
          {TIME_FILTERS.map((f) => (
            <button key={String(f.value)} type="button"
              onClick={() => { setSinceHours(f.value); doSearch(query, location, f.value); }}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                sinceHours === f.value
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-indigo-400'
              )}>
              {f.label}
            </button>
          ))}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" /> {error}
        </div>
      )}

      {/* Loading skeleton */}
      {loading && !result && (
        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold text-gray-900 dark:text-white">
              {result.filteredCount} jobs
              {query ? ` for "${query}"` : ' (latest)'}
            </span>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-500" />}

            <div className="flex flex-wrap gap-1.5 ml-auto">
              {result.sources.filter((s) => s.jobs.length > 0).map((s) => (
                <span key={s.sourceId} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                  <CheckCircle2 className="w-3 h-3" /> {s.sourceName} ({s.jobs.length})
                </span>
              ))}
              {result.sources.filter((s) => s.error && s.jobs.length === 0).map((s) => (
                <span key={s.sourceId} title={s.error}
                  className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                  <X className="w-3 h-3" /> {s.sourceName}
                </span>
              ))}
            </div>
          </div>

          {/* Job cards */}
          {result.jobs.length === 0 ? (
            <div className="card p-12 text-center">
              <Globe className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 font-medium">No results found.</p>
              <p className="text-sm text-gray-400 mt-1">Try different keywords or clear the location field.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {result.jobs.map((job) => (
                <div key={job.id} className="card p-5 hover:shadow-md transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {job.title}
                        </h3>
                        {job.remote && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-medium">
                            Remote
                          </span>
                        )}
                        {job.jobType && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">
                            {job.jobType}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{job.company}</span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />{job.location}
                          </span>
                        )}
                        {job.salary && (
                          <span className="font-medium text-emerald-600 dark:text-emerald-400">{job.salary}</span>
                        )}
                        {job.postedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />{relativeTime(job.postedAt)}
                          </span>
                        )}
                      </div>
                      {job.tags && job.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {job.tags.slice(0, 6).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-500">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', categoryBadge[job.sourceCategory] ?? categoryBadge.generic)}>
                        {job.source}
                      </span>
                      <div className="flex items-center gap-2">
                        <button onClick={() => saveJob(job.id)}
                          title={saved.has(job.id) ? 'Remove bookmark' : 'Save job'}
                          className={cn('p-1.5 rounded-lg transition-colors',
                            saved.has(job.id)
                              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950'
                              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'
                          )}>
                          <Bookmark className="w-4 h-4" />
                        </button>
                        <a href={job.url} target="_blank" rel="noopener noreferrer"
                          className="btn-primary py-1.5 px-3 text-xs">
                          Apply <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
