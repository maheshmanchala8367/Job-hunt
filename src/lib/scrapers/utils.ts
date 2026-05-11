import { ScrapedJob } from './types';

const FETCH_TIMEOUT_MS = 10_000;

const DEFAULT_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
};

export async function safeFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: { ...DEFAULT_HEADERS, ...(options.headers ?? {}) },
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function safeJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await safeFetch(url, {
    ...options,
    headers: { ...DEFAULT_HEADERS, Accept: 'application/json', ...(options.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`);
  return res.json() as Promise<T>;
}

export function makeId(source: string, externalId: string | number): string {
  return `${source}::${externalId}`;
}

export function filterByTime(jobs: ScrapedJob[], sinceHours?: number): ScrapedJob[] {
  if (!sinceHours) return jobs;
  const cutoff = Date.now() - sinceHours * 3_600_000;
  return jobs.filter((j) => j.postedAt && j.postedAt.getTime() >= cutoff);
}

export function deduplicateJobs(jobs: ScrapedJob[]): ScrapedJob[] {
  const seen = new Set<string>();
  return jobs.filter((j) => {
    if (seen.has(j.id)) return false;
    seen.add(j.id);
    return true;
  });
}

export function matchesKeywords(job: ScrapedJob, query: string): boolean {
  if (!query.trim()) return true;
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const haystack = [job.title, job.company, ...(job.tags ?? [])].join(' ').toLowerCase();
  return words.every((w) => haystack.includes(w));
}

export function parseRelativeDate(text: string): Date | null {
  if (!text) return null;
  const lower = text.toLowerCase().trim();
  const now = Date.now();

  if (lower.includes('just') || lower.includes('moment') || lower === 'now') return new Date(now);
  const m = lower.match(/(\d+)\s*(second|minute|hour|day|week|month)/);
  if (!m) return null;
  const n = parseInt(m[1]);
  const unit = m[2];
  const map: Record<string, number> = {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000,
  };
  return new Date(now - n * (map[unit] ?? 0));
}
