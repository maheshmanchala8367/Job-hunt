/**
 * Individual scraper implementations for all 38+ sources.
 *
 * Categories:
 *  - api:     Sources with public JSON APIs (most reliable)
 *  - ats:     Company-specific ATS boards (Greenhouse, Lever, Ashby, etc.)
 *  - board:   Job-board aggregators (Wellfound, Builtin, Remote Rocketship…)
 *  - generic: Subdomain patterns & "other pages"
 *
 * Notes on per-company ATS sources:
 *   These use URL patterns like https://boards.greenhouse.io/{company}/jobs.json
 *   The caller must pass `params.companies` (list of company slugs).
 *   When no companies are provided the scraper returns [].
 */

import { load as cheerioLoad } from 'cheerio';
import { ScrapedJob, SearchParams } from './types';
import { safeJson, safeFetch, makeId, parseRelativeDate } from './utils';
import { ALL_SEEDS } from './company-seeds';
import crypto from 'crypto';

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
function shortHash(s: string) {
  return crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
}

// ─── API SOURCES ─────────────────────────────────────────────────────────────

/** Remotive – free REST API */
export async function scrapeRemotive(p: SearchParams): Promise<ScrapedJob[]> {
  const url = p.query.trim()
    ? `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(p.query)}&limit=100`
    : `https://remotive.com/api/remote-jobs?limit=100`;
  const data = await safeJson<{ jobs: RemotiveJob[] }>(url);
  return data.jobs.map((j) => ({
    id: makeId('remotive', j.id),
    title: j.title,
    company: j.company_name,
    location: j.candidate_required_location || 'Remote',
    url: j.url,
    source: 'Remotive',
    sourceCategory: 'api',
    postedAt: j.publication_date ? new Date(j.publication_date) : null,
    salary: j.salary || undefined,
    jobType: j.job_type,
    remote: true,
    tags: j.tags,
  }));
}
interface RemotiveJob {
  id: number; title: string; url: string; company_name: string;
  candidate_required_location: string; publication_date: string;
  salary: string; job_type: string; tags: string[];
}

/** Remote OK – public JSON feed */
export async function scrapeRemoteOk(p: SearchParams): Promise<ScrapedJob[]> {
  const data = await safeJson<RemoteOkJob[]>('https://remoteok.com/api', {
    headers: { Accept: 'application/json' },
  });
  const q = p.query.toLowerCase();
  return data
    .filter((j): j is RemoteOkJob & { slug: string } => !!j.slug)
    .filter((j) =>
      j.position?.toLowerCase().includes(q) ||
      j.company?.toLowerCase().includes(q) ||
      (j.tags ?? []).some((t) => t.toLowerCase().includes(q))
    )
    .slice(0, 50)
    .map((j) => ({
      id: makeId('remoteok', j.id),
      title: j.position,
      company: j.company,
      location: 'Remote',
      url: `https://remoteok.com/remote-jobs/${j.slug}`,
      source: 'Remote OK',
      sourceCategory: 'api',
      postedAt: j.date ? new Date(Number(j.date) * 1000) : null,
      salary: j.salary_min && j.salary_max ? `$${j.salary_min}–$${j.salary_max}` : undefined,
      remote: true,
      tags: j.tags,
    }));
}
interface RemoteOkJob {
  id: string; slug?: string; position: string; company: string;
  date: string; salary_min?: number; salary_max?: number; tags?: string[];
}

/** Himalayas – free public JSON API, no key needed */
export async function scrapeHimalayas(p: SearchParams): Promise<ScrapedJob[]> {
  const q = p.query.trim();
  const url = q
    ? `https://himalayas.app/jobs/api?q=${encodeURIComponent(q)}&limit=100`
    : `https://himalayas.app/jobs/api?limit=100`;
  const data = await safeJson<{ jobs: HimalayasJob[] }>(url);
  return (data.jobs ?? []).map((j) => ({
    id: makeId('himalayas', j.id ?? shortHash(j.title + j.companyName)),
    title: j.title,
    company: j.companyName,
    location: j.jobLocation ?? 'Remote',
    url: j.applicationUrl ?? j.url ?? '',
    source: 'Himalayas',
    sourceCategory: 'api',
    postedAt: j.datePosted ? new Date(j.datePosted) : null,
    salary: j.salary?.min && j.salary?.max ? `$${(j.salary.min/1000).toFixed(0)}k–$${(j.salary.max/1000).toFixed(0)}k` : undefined,
    remote: true,
    tags: j.skills ?? [],
  }));
}
interface HimalayasJob {
  id?: string; title: string; companyName: string; jobLocation?: string;
  applicationUrl?: string; url?: string; datePosted?: string;
  salary?: { min?: number; max?: number; currency?: string }; skills?: string[];
}

/** We Work Remotely – RSS feed (always reliable) */
export async function scrapeWeWorkRemotely(p: SearchParams): Promise<ScrapedJob[]> {
  const q = p.query.toLowerCase().trim();
  // Use their search page RSS when query provided, otherwise all-jobs RSS
  const url = q
    ? `https://weworkremotely.com/remote-jobs/search?term=${encodeURIComponent(p.query)}&button=`
    : `https://weworkremotely.com/remote-jobs.rss`;

  const res = await safeFetch(url);
  if (!res.ok) throw new Error(`We Work Remotely responded ${res.status}`);
  const text = await res.text();

  const jobs: ScrapedJob[] = [];

  if (url.endsWith('.rss') || text.trim().startsWith('<?xml')) {
    // Parse RSS
    const items = text.match(/<item[\s\S]*?<\/item>/g) ?? [];
    for (const item of items) {
      const title  = (item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ?? item.match(/<title>(.*?)<\/title>/)?.[1] ?? '').trim();
      const link   = (item.match(/<link>(.*?)<\/link>/)?.[1] ?? '').trim();
      const region = (item.match(/<region><!\[CDATA\[(.*?)\]\]><\/region>/)?.[1] ?? 'Remote').trim();
      const pubStr = (item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] ?? '').trim();
      const company= (item.match(/<company><!\[CDATA\[(.*?)\]\]><\/company>/)?.[1] ?? '').trim();
      if (!title || title === 'We Work Remotely: Remote jobs board') continue;
      if (q && !title.toLowerCase().includes(q.split(' ')[0])) continue;
      jobs.push({
        id: makeId('weworkremotely', shortHash(link || title)),
        title, company: company || 'Unknown',
        location: region || 'Remote',
        url: link,
        source: 'We Work Remotely',
        sourceCategory: 'board',
        postedAt: pubStr ? new Date(pubStr) : null,
        remote: true,
      });
    }
  } else {
    // Parse HTML search results
    const $ = cheerioLoad(text);
    $('li.feature, ul.jobs li').each((_, el) => {
      const titleEl = $(el).find('.title, h2, h3').first();
      const title   = titleEl.text().trim();
      const company = $(el).find('.company, .company-name').first().text().trim();
      const href    = $(el).find('a').first().attr('href') ?? '';
      const region  = $(el).find('.region, .location').first().text().trim();
      if (!title) return;
      jobs.push({
        id: makeId('weworkremotely', shortHash(href || title)),
        title, company: company || 'Unknown',
        location: region || 'Remote',
        url: href.startsWith('http') ? href : `https://weworkremotely.com${href}`,
        source: 'We Work Remotely',
        sourceCategory: 'board',
        postedAt: null,
        remote: true,
      });
    });
  }
  return jobs.slice(0, 80);
}

/** LinkedIn Jobs Guest API – bypasses the main site block */
export async function scrapeLinkedInGuest(p: SearchParams): Promise<ScrapedJob[]> {
  const kw  = encodeURIComponent(p.query || 'software engineer');
  const loc = encodeURIComponent(p.location || '');
  const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${kw}&location=${loc}&start=0`;
  const res = await safeFetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
      Accept: 'text/html',
    },
  });
  if (!res.ok) throw new Error(`LinkedIn guest API ${res.status}`);
  const html = await res.text();
  const $    = cheerioLoad(html);
  const jobs: ScrapedJob[] = [];

  $('li').each((_, el) => {
    const title   = $(el).find('.base-search-card__title').text().trim();
    const company = $(el).find('.base-search-card__subtitle').text().trim();
    const loc2    = $(el).find('.job-search-card__location').text().trim();
    const href    = $(el).find('a.base-card__full-link').attr('href')
                 ?? $(el).find('a').first().attr('href') ?? '';
    const dateStr = $(el).find('time').attr('datetime') ?? '';
    if (!title) return;
    jobs.push({
      id: makeId('linkedin', shortHash(href || title + company)),
      title, company, location: loc2,
      url: href,
      source: 'LinkedIn',
      sourceCategory: 'board',
      postedAt: dateStr ? new Date(dateStr) : null,
    });
  });
  return jobs;
}

/** Arbeitnow – free REST API */
export async function scrapeArbeitnow(p: SearchParams): Promise<ScrapedJob[]> {
  const url = `https://www.arbeitnow.com/api/job-board-api?search=${encodeURIComponent(p.query)}`;
  const data = await safeJson<{ data: ArbeitnowJob[] }>(url);
  return data.data.slice(0, 50).map((j) => ({
    id: makeId('arbeitnow', j.slug),
    title: j.title,
    company: j.company_name,
    location: j.location || 'Remote',
    url: j.url,
    source: 'Arbeitnow',
    sourceCategory: 'api',
    postedAt: j.created_at ? new Date(j.created_at * 1000) : null,
    remote: j.remote,
    tags: j.tags,
  }));
}
interface ArbeitnowJob {
  slug: string; title: string; company_name: string; location: string;
  url: string; created_at: number; remote: boolean; tags: string[];
}

// ─── ATS COMPANY-BOARD SOURCES ────────────────────────────────────────────────

async function atsForEachCompany<T>(
  companies: string[],
  urlFn: (c: string) => string,
  mapFn: (data: T, company: string) => ScrapedJob[],
  source: string,
  query: string,
  seedKey?: string
): Promise<ScrapedJob[]> {
  // Auto-use seed list when no companies provided
  const list = companies.length > 0 ? companies : (seedKey ? ALL_SEEDS[seedKey] ?? [] : []);
  if (list.length === 0) return [];

  const q = query.toLowerCase().trim();
  const results = await Promise.allSettled(
    list.map(async (c) => {
      try {
        const data = await safeJson<T>(urlFn(c));
        const jobs = mapFn(data, c);
        // Title filter only when query is provided; skip if empty (return all)
        return q ? jobs.filter((j) => j.title.toLowerCase().includes(q)) : jobs;
      } catch {
        return [];
      }
    })
  );
  return results
    .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
    .map((j) => ({ ...j, source }));
}

/** Greenhouse */
export async function scrapeGreenhouse(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ jobs: GhJob[] }>(
    p.companies ?? [],
    (c) => `https://boards-api.greenhouse.io/v1/boards/${c}/jobs?content=true`,
    (data, company) =>
      data.jobs.map((j) => ({
        id: makeId('greenhouse', j.id),
        title: j.title,
        company: j.company_name || company,
        location: j.location?.name || '',
        url: j.absolute_url,
        source: 'Greenhouse',
        sourceCategory: 'ats',
        postedAt: j.updated_at ? new Date(j.updated_at) : null,
      })),
    'Greenhouse',
    p.query,
    'greenhouse'
  );
}
interface GhJob {
  id: number; title: string; company_name: string; absolute_url: string;
  location: { name: string }; updated_at: string;
}

/** Lever */
export async function scrapeLever(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<LeverJob[]>(
    p.companies ?? [],
    (c) => `https://api.lever.co/v0/postings/${c}?mode=json`,
    (data, company) =>
      data.map((j) => ({
        id: makeId('lever', j.id),
        title: j.text,
        company,
        location: j.categories?.location || j.workplaceType || '',
        url: j.hostedUrl,
        source: 'Lever',
        sourceCategory: 'ats',
        postedAt: j.createdAt ? new Date(j.createdAt) : null,
        jobType: j.categories?.commitment,
      })),
    'Lever',
    p.query,
    'lever'
  );
}
interface LeverJob {
  id: string; text: string; hostedUrl: string; createdAt: number;
  workplaceType: string; categories: { location: string; commitment: string };
}

/** Ashby */
export async function scrapeAshby(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ jobPostings: AshbyJob[] }>(
    p.companies ?? [],
    (c) => `https://api.ashbyhq.com/posting-api/job-board/${c}`,
    (data, company) =>
      data.jobPostings.map((j) => ({
        id: makeId('ashby', j.id),
        title: j.title,
        company,
        location: j.locationName || (j.isRemote ? 'Remote' : ''),
        url: j.jobUrl,
        source: 'Ashby',
        sourceCategory: 'ats',
        postedAt: j.publishedDate ? new Date(j.publishedDate) : null,
        remote: j.isRemote,
      })),
    'Ashby',
    p.query,
    'ashby'
  );
}
interface AshbyJob {
  id: string; title: string; locationName: string; isRemote: boolean;
  jobUrl: string; publishedDate: string;
}

/** Workable */
export async function scrapeWorkable(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ jobs: WorkableJob[] }>(
    p.companies ?? [],
    (c) => `https://apply.workable.com/api/v3/accounts/${c}/jobs`,
    (data, company) =>
      data.jobs.map((j) => ({
        id: makeId('workable', j.shortcode),
        title: j.title,
        company,
        location: j.location || j.workplace || '',
        url: `https://apply.workable.com/${company}/j/${j.shortcode}/`,
        source: 'Workable',
        sourceCategory: 'ats',
        postedAt: j.published_on ? new Date(j.published_on) : null,
        jobType: j.employment_type,
        remote: j.workplace === 'remote',
      })),
    'Workable',
    p.query,
    'workable'
  );
}
interface WorkableJob {
  shortcode: string; title: string; location: string; workplace: string;
  published_on: string; employment_type: string;
}

/** BreezyHR */
export async function scrapeBreezyHR(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<BreezyJob[]>(
    p.companies ?? [],
    (c) => `https://${c}.breezy.hr/json`,
    (data, company) =>
      data.map((j) => ({
        id: makeId('breezyhr', j._id),
        title: j.name,
        company,
        location: j.location?.name || '',
        url: `https://${company}.breezy.hr/p/${j._id}`,
        source: 'BreezyHR',
        sourceCategory: 'ats',
        postedAt: j.updated ? new Date(j.updated) : null,
        jobType: j.type?.name,
      })),
    'BreezyHR',
    p.query,
    'breezyhr'
  );
}
interface BreezyJob {
  _id: string; name: string; type: { name: string }; location: { name: string }; updated: string;
}

/** Recruitee */
export async function scrapeRecruitee(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ offers: RecruiteeJob[] }>(
    p.companies ?? [],
    (c) => `https://${c}.recruitee.com/api/offers/`,
    (data, company) =>
      data.offers.map((j) => ({
        id: makeId('recruitee', j.id),
        title: j.title,
        company,
        location: j.location || '',
        url: j.careers_url,
        source: 'Recruitee',
        sourceCategory: 'ats',
        postedAt: j.published_at ? new Date(j.published_at) : null,
        jobType: j.employment_type_label,
        remote: j.remote,
      })),
    'Recruitee',
    p.query,
    'recruitee'
  );
}
interface RecruiteeJob {
  id: number; title: string; location: string; careers_url: string;
  published_at: string; employment_type_label: string; remote: boolean;
}

/** SmartRecruiters */
export async function scrapeSmartRecruiters(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ content: SrJob[] }>(
    p.companies ?? [],
    (c) => `https://api.smartrecruiters.com/v1/companies/${c}/postings?limit=50`,
    (data, company) =>
      data.content.map((j) => ({
        id: makeId('smartrecruiters', j.uuid),
        title: j.name,
        company,
        location: j.location ? `${j.location.city}, ${j.location.country}` : '',
        url: j.ref,
        source: 'SmartRecruiters',
        sourceCategory: 'ats',
        postedAt: j.releasedDate ? new Date(j.releasedDate) : null,
        jobType: j.typeOfEmployment?.label,
      })),
    'SmartRecruiters',
    p.query,
    'smartrecruiters'
  );
}
interface SrJob {
  uuid: string; name: string; ref: string; releasedDate: string;
  location: { city: string; country: string }; typeOfEmployment: { label: string };
}

/** JazzHR */
export async function scrapeJazzHR(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<JazzJob[]>(
    p.companies ?? [],
    (c) => `https://${c}.applytojob.com/apply/jobs/listAll`,
    (data, company) =>
      data.map((j) => ({
        id: makeId('jazzhr', j.id),
        title: j.title,
        company,
        location: j.city && j.state ? `${j.city}, ${j.state}` : j.city || '',
        url: j.apply_url,
        source: 'JazzHR',
        sourceCategory: 'ats',
        postedAt: j.open_date ? new Date(j.open_date) : null,
        jobType: j.type,
      })),
    'JazzHR',
    p.query,
    'jazzhr'
  );
}
interface JazzJob {
  id: string; title: string; city: string; state: string;
  apply_url: string; open_date: string; type: string;
}

/** Teamtailor */
export async function scrapeTeamtailor(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ data: TtJob[] }>(
    p.companies ?? [],
    (c) => `https://api.teamtailor.com/v1/jobs?filter[locations.name]=${encodeURIComponent(p.query)}&page[size]=50`,
    (data, company) =>
      data.data.map((j) => ({
        id: makeId('teamtailor', j.id),
        title: j.attributes.title,
        company,
        location: j.attributes.location || '',
        url: j.links?.['career-site-job'] || '',
        source: 'Teamtailor',
        sourceCategory: 'ats',
        postedAt: j.attributes['created-at'] ? new Date(j.attributes['created-at']) : null,
        remote: j.attributes.remote,
      })),
    'Teamtailor',
    p.query,
    'teamtailor'
  );
}
interface TtJob {
  id: string; links: Record<string, string>;
  attributes: { title: string; location: string; remote: boolean; 'created-at': string };
}

/** Jobvite */
export async function scrapeJobvite(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ requisitions: JvJob[] }>(
    p.companies ?? [],
    (c) => `https://jobs.jobvite.com/${c}/search-jobs/results?q=${encodeURIComponent(p.query)}`,
    (data, company) =>
      data.requisitions.map((j) => ({
        id: makeId('jobvite', j.jobId),
        title: j.title,
        company,
        location: j.location,
        url: j.applyUrl,
        source: 'Jobvite',
        sourceCategory: 'ats',
        postedAt: j.date ? new Date(j.date) : null,
      })),
    'Jobvite',
    p.query
  );
}
interface JvJob { jobId: string; title: string; location: string; applyUrl: string; date: string }

/** Pinpoint */
export async function scrapePinpoint(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ jobs: PpJob[] }>(
    p.companies ?? [],
    (c) => `https://${c}.pinpointhq.com/postings.json`,
    (data, company) =>
      data.jobs.map((j) => ({
        id: makeId('pinpoint', j.id),
        title: j.title,
        company,
        location: j.location || '',
        url: `https://${company}.pinpointhq.com/postings/${j.id}`,
        source: 'Pinpoint',
        sourceCategory: 'ats',
        postedAt: j.created_at ? new Date(j.created_at) : null,
      })),
    'Pinpoint',
    p.query,
    'pinpoint'
  );
}
interface PpJob { id: string; title: string; location: string; created_at: string }

/** Homerun */
export async function scrapeHomerun(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ vacancies: HrJob[] }>(
    p.companies ?? [],
    (c) => `https://${c}.homerun.co/vacancies.json`,
    (data, company) =>
      data.vacancies.map((j) => ({
        id: makeId('homerun', j.id),
        title: j.title,
        company,
        location: j.location || '',
        url: j.apply_url,
        source: 'Homerun',
        sourceCategory: 'ats',
        postedAt: j.published_at ? new Date(j.published_at) : null,
      })),
    'Homerun',
    p.query,
    'homerun'
  );
}
interface HrJob { id: string; title: string; location: string; apply_url: string; published_at: string }

/** Dover */
export async function scrapeDover(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<{ jobs: DoverJob[] }>(
    p.companies ?? [],
    (c) => `https://app.dover.io/api/v1/jobs/?company=${c}`,
    (data, company) =>
      data.jobs.map((j) => ({
        id: makeId('dover', j.id),
        title: j.title,
        company,
        location: j.location || '',
        url: j.job_url,
        source: 'Dover',
        sourceCategory: 'ats',
        postedAt: j.created_at ? new Date(j.created_at) : null,
      })),
    'Dover',
    p.query
  );
}
interface DoverJob { id: string; title: string; location: string; job_url: string; created_at: string }

/** CareerPuck */
export async function scrapeCareerPuck(p: SearchParams): Promise<ScrapedJob[]> {
  return atsForEachCompany<CpJob[]>(
    p.companies ?? [],
    (c) => `https://api.careerpuck.com/v1/companies/${c}/jobs`,
    (data, company) =>
      data.map((j) => ({
        id: makeId('careerpuck', j.id),
        title: j.title,
        company,
        location: j.location || '',
        url: j.url,
        source: 'CareerPuck',
        sourceCategory: 'ats',
        postedAt: j.posted_at ? new Date(j.posted_at) : null,
      })),
    'CareerPuck',
    p.query
  );
}
interface CpJob { id: string; title: string; location: string; url: string; posted_at: string }

/**
 * Generic ATS scrapers — these follow a predictable URL/JSON pattern
 * but require a company slug. They use the same atsForEachCompany helper.
 */

export async function scrapeIcims(p: SearchParams): Promise<ScrapedJob[]> {
  // iCIMS uses per-company portals; scrape the search result page
  if (!p.companies?.length) return [];
  const q = p.query.toLowerCase();
  const results = await Promise.allSettled(
    p.companies.map(async (c) => {
      const res = await safeFetch(
        `https://careers.icims.com/jobs/search?ss=1&searchKeyword=${encodeURIComponent(p.query)}&in_iframe=1&company=${c}`
      );
      if (!res.ok) return [];
      const html = await res.text();
      const $ = cheerioLoad(html);
      const jobs: ScrapedJob[] = [];
      $('.iCIMS_JobsTable .iCIMS_Expandable_Container').each((_, el) => {
        const title = $(el).find('.iCIMS_JobTitle a').text().trim();
        const href = $(el).find('.iCIMS_JobTitle a').attr('href') || '';
        const loc = $(el).find('.iCIMS_Location').text().trim();
        if (!title) return;
        jobs.push({
          id: makeId('icims', shortHash(href || title + c)),
          title,
          company: c,
          location: loc,
          url: href.startsWith('http') ? href : `https://careers.icims.com${href}`,
          source: 'iCIMS',
          sourceCategory: 'ats',
          postedAt: null,
        });
      });
      return jobs.filter((j) => j.title.toLowerCase().includes(q));
    })
  );
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

// Stub helpers for ATS platforms without a clean public JSON endpoint
async function stubAts(
  p: SearchParams,
  source: string,
  urlFn: (c: string) => string
): Promise<ScrapedJob[]> {
  if (!p.companies?.length) return [];
  return p.companies.map((c) => ({
    id: makeId(slug(source), `${c}-search`),
    title: `Search results for "${p.query}" at ${c}`,
    company: c,
    location: '',
    url: urlFn(c),
    source,
    sourceCategory: 'ats' as const,
    postedAt: null,
  }));
}

export async function scrapeWorkday(p: SearchParams) {
  return stubAts(p, 'Workday', (c) => `https://${c}.wd1.myworkdayjobs.com/en-US/External_Careers`);
}
export async function scrapeOracleCloud(p: SearchParams) {
  return stubAts(p, 'Oracle Cloud (Taleo)', (c) => `https://${c}.taleo.net/careersection/2/jobsearch.ftl`);
}
export async function scrapeAdp(p: SearchParams) {
  return stubAts(p, 'ADP', (c) => `https://jobs.adp.com/job-search-results/?keyword=${encodeURIComponent(p.query)}`);
}
export async function scrapeRippling(p: SearchParams) {
  return stubAts(p, 'Rippling', (c) => `https://www.rippling.com/careers`);
}
export async function scrapeGusto(p: SearchParams) {
  return stubAts(p, 'Gusto', (c) => `https://gusto.com/careers`);
}
export async function scrapePaylocity(p: SearchParams) {
  return stubAts(p, 'Paylocity', (c) => `https://${c}.paylocity.com/recruiting/jobs/all`);
}
export async function scrapeKeka(p: SearchParams) {
  return stubAts(p, 'Keka', (c) => `https://${c}.keka.com/careers`);
}
export async function scrapeGem(p: SearchParams) {
  return stubAts(p, 'Gem', (c) => `https://jobs.gem.com/${c}`);
}
export async function scrapeTrakstar(p: SearchParams) {
  return stubAts(p, 'Trakstar', (c) => `https://${c}.hire.trakstar.com/jobs`);
}
export async function scrapeCats(p: SearchParams) {
  return stubAts(p, 'CATS', (c) => `https://${c}.catsone.com/careers`);
}
export async function scrapeTalentReef(p: SearchParams) {
  return stubAts(p, 'TalentReef', (c) => `https://talentreef.com/employer/${c}/jobs`);
}
export async function scrapeTriNetHire(p: SearchParams) {
  return stubAts(p, 'TriNet Hire', (c) => `https://hire.trinet.com/jobs/${c}`);
}
export async function scrapeFactorial(p: SearchParams) {
  return stubAts(p, 'Factorial', (c) => `https://factorialhr.com/jobs/${c}`);
}
export async function scrapeNotionCareers(p: SearchParams) {
  return stubAts(p, 'Notion', (c) => `https://www.notion.so/careers`);
}

// ─── JOB BOARD / AGGREGATOR SOURCES ──────────────────────────────────────────

/** Y Combinator Work at a Startup – parses Next.js __NEXT_DATA__ */
export async function scrapeYCombinator(p: SearchParams): Promise<ScrapedJob[]> {
  const q = p.query.trim();
  const url = q
    ? `https://www.workatastartup.com/jobs?q=${encodeURIComponent(q)}`
    : `https://www.workatastartup.com/jobs`;
  const res = await safeFetch(url, { headers: { Accept: 'text/html' } });
  if (!res.ok) throw new Error(`YC responded ${res.status}`);
  const html = await res.text();

  // Try __NEXT_DATA__ first (most reliable)
  const ndMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (ndMatch) {
    try {
      const nd = JSON.parse(ndMatch[1]);
      const jobs: YCJob[] =
        nd?.props?.pageProps?.jobs ??
        nd?.props?.pageProps?.initialJobs ??
        nd?.props?.pageProps?.data?.jobs ?? [];
      return jobs.slice(0, 80).map((j) => ({
        id: makeId('yc', String(j.id || shortHash(j.title + (j.company?.name ?? '')))),
        title: j.title ?? j.role ?? '',
        company: j.company?.name ?? j.startup_name ?? '',
        location: Array.isArray(j.locations) ? j.locations.join(', ') : (j.location ?? 'Remote'),
        url: j.url ?? (j.id ? `https://www.workatastartup.com/jobs/${j.id}` : ''),
        source: 'Y Combinator',
        sourceCategory: 'board',
        postedAt: j.created_at ? new Date(j.created_at) : null,
        salary: j.salary_min && j.salary_max ? `$${j.salary_min / 1000}k–$${j.salary_max / 1000}k` : undefined,
        remote: j.remote ?? false,
        tags: j.skills ?? [],
      }));
    } catch { /* fall through to HTML parsing */ }
  }

  // Fallback HTML parsing
  const $ = cheerioLoad(html);
  const jobs: ScrapedJob[] = [];
  $('[data-job-id], .job-card, article').each((_, el) => {
    const title = $(el).find('.job-title, h2, h3').first().text().trim();
    const company = $(el).find('.company-name, [class*="company"]').first().text().trim();
    const loc = $(el).find('.job-location, [class*="location"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') ?? '';
    const jobId = $(el).attr('data-job-id') || shortHash(title + company);
    if (!title) return;
    jobs.push({
      id: makeId('yc', jobId), title, company,
      location: loc || 'Remote',
      url: href.startsWith('http') ? href : `https://www.workatastartup.com${href}`,
      source: 'Y Combinator', sourceCategory: 'board', postedAt: null,
    });
  });
  return jobs;
}
interface YCJob {
  id?: number | string; title?: string; role?: string; company?: { name: string };
  startup_name?: string; locations?: string[]; location?: string; url?: string;
  created_at?: string; salary_min?: number; salary_max?: number;
  remote?: boolean; skills?: string[];
}

/** Wellfound (AngelList Talent) */
export async function scrapeWellfound(p: SearchParams): Promise<ScrapedJob[]> {
  const url = `https://wellfound.com/jobs?q=${encodeURIComponent(p.query)}`;
  const res = await safeFetch(url);
  if (!res.ok) throw new Error(`Wellfound responded ${res.status}`);
  const html = await res.text();
  const $ = cheerioLoad(html);
  const jobs: ScrapedJob[] = [];

  $('[data-test="JobSearchResult"]').each((_, el) => {
    const title = $(el).find('[data-test="jobTitle"]').text().trim();
    const company = $(el).find('[data-test="companyName"]').text().trim();
    const loc = $(el).find('[data-test="jobLocations"]').text().trim();
    const href = $(el).find('a').first().attr('href') || '';
    if (!title) return;
    jobs.push({
      id: makeId('wellfound', shortHash(title + company + href)),
      title,
      company,
      location: loc,
      url: href.startsWith('http') ? href : `https://wellfound.com${href}`,
      source: 'Wellfound',
      sourceCategory: 'board',
      postedAt: null,
    });
  });
  return jobs;
}

/** Builtin */
export async function scrapeBuiltin(p: SearchParams): Promise<ScrapedJob[]> {
  const url = `https://builtin.com/jobs?search=${encodeURIComponent(p.query)}`;
  const res = await safeFetch(url);
  if (!res.ok) throw new Error(`Builtin responded ${res.status}`);
  const html = await res.text();
  const $ = cheerioLoad(html);
  const jobs: ScrapedJob[] = [];

  $('[data-id]').each((_, el) => {
    const title = $(el).find('h2').text().trim();
    const company = $(el).find('[class*="company"]').first().text().trim();
    const loc = $(el).find('[class*="location"]').first().text().trim();
    const href = $(el).find('a').first().attr('href') || '';
    if (!title) return;
    jobs.push({
      id: makeId('builtin', $(el).attr('data-id') || shortHash(href)),
      title,
      company,
      location: loc,
      url: href.startsWith('http') ? href : `https://builtin.com${href}`,
      source: 'Builtin',
      sourceCategory: 'board',
      postedAt: null,
    });
  });
  return jobs;
}

/** Remote Rocketship */
export async function scrapeRemoteRocketship(p: SearchParams): Promise<ScrapedJob[]> {
  const url = `https://remoterocketship.com/jobs?q=${encodeURIComponent(p.query)}`;
  const res = await safeFetch(url);
  if (!res.ok) throw new Error(`Remote Rocketship responded ${res.status}`);
  const html = await res.text();
  const $ = cheerioLoad(html);
  const jobs: ScrapedJob[] = [];

  $('article').each((_, el) => {
    const title = $(el).find('h2,h3').first().text().trim();
    const company = $(el).find('[class*="company"]').text().trim();
    const loc = $(el).find('[class*="location"]').text().trim();
    const href = $(el).find('a').attr('href') || '';
    const postedText = $(el).find('time,[class*="date"],[class*="time"]').text().trim();
    if (!title) return;
    jobs.push({
      id: makeId('remoterocketship', shortHash(href || title + company)),
      title,
      company,
      location: loc || 'Remote',
      url: href.startsWith('http') ? href : `https://remoterocketship.com${href}`,
      source: 'Remote Rocketship',
      sourceCategory: 'board',
      postedAt: parseRelativeDate(postedText),
      remote: true,
    });
  });
  return jobs;
}

/** LinkedIn — best-effort public search (may be blocked) */
export async function scrapeLinkedIn(p: SearchParams): Promise<ScrapedJob[]> {
  const url = `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(p.query)}&location=${encodeURIComponent(p.location || '')}`;
  const res = await safeFetch(url, {
    headers: { 'Accept-Language': 'en-US,en;q=0.9' },
  });
  if (!res.ok) throw new Error(`LinkedIn responded ${res.status} (auth may be required)`);
  const html = await res.text();
  const $ = cheerioLoad(html);
  const jobs: ScrapedJob[] = [];

  $('.base-card').each((_, el) => {
    const title = $(el).find('.base-search-card__title').text().trim();
    const company = $(el).find('.base-search-card__subtitle a').text().trim();
    const loc = $(el).find('.job-search-card__location').text().trim();
    const href = $(el).find('a.base-card__full-link').attr('href') || '';
    const postedText = $(el).find('time').attr('datetime') || '';
    if (!title) return;
    jobs.push({
      id: makeId('linkedin', shortHash(href)),
      title,
      company,
      location: loc,
      url: href,
      source: 'LinkedIn',
      sourceCategory: 'board',
      postedAt: postedText ? new Date(postedText) : null,
    });
  });
  return jobs;
}

/** Glassdoor — best-effort (often blocked) */
export async function scrapeGlassdoor(p: SearchParams): Promise<ScrapedJob[]> {
  const url = `https://www.glassdoor.com/Job/jobs.htm?sc.keyword=${encodeURIComponent(p.query)}`;
  const res = await safeFetch(url);
  if (!res.ok) throw new Error(`Glassdoor responded ${res.status}`);
  const html = await res.text();
  const $ = cheerioLoad(html);
  const jobs: ScrapedJob[] = [];

  $('[data-test="jobListing"]').each((_, el) => {
    const title = $(el).find('[data-test="job-title"]').text().trim();
    const company = $(el).find('[data-test="employer-name"]').text().trim();
    const loc = $(el).find('[data-test="emp-location"]').text().trim();
    const href = $(el).find('a').attr('href') || '';
    if (!title) return;
    jobs.push({
      id: makeId('glassdoor', shortHash(href || title + company)),
      title,
      company,
      location: loc,
      url: href.startsWith('http') ? href : `https://www.glassdoor.com${href}`,
      source: 'Glassdoor',
      sourceCategory: 'board',
      postedAt: null,
    });
  });
  return jobs;
}

// ─── GENERIC SUBDOMAIN / CAREER PAGE SCRAPERS ─────────────────────────────────

/**
 * Generic career-page scraper.
 * Handles: /careers, /jobs subdomains, /people and /talent subdomains.
 * Caller provides full base URLs in `params.companies` (treated as URL list).
 */
export async function scrapeGenericCareersPage(
  p: SearchParams,
  source: string
): Promise<ScrapedJob[]> {
  if (!p.companies?.length) return [];
  const q = p.query.toLowerCase();
  const results = await Promise.allSettled(
    p.companies.map(async (url) => {
      const res = await safeFetch(url);
      if (!res.ok) return [];
      const html = await res.text();
      const $ = cheerioLoad(html);
      const jobs: ScrapedJob[] = [];

      // Try common job listing patterns
      $('a[href]').each((_, el) => {
        const text = $(el).text().trim();
        const href = $(el).attr('href') || '';
        if (text.length < 5 || text.length > 120) return;
        if (
          !href.includes('/job') &&
          !href.includes('/career') &&
          !href.includes('/position') &&
          !href.includes('/opening') &&
          !href.includes('/role')
        ) return;
        if (!text.toLowerCase().includes(q.split(' ')[0])) return;
        jobs.push({
          id: makeId(slug(source), shortHash(href)),
          title: text,
          company: new URL(url).hostname,
          location: '',
          url: href.startsWith('http') ? href : new URL(href, url).href,
          source,
          sourceCategory: 'generic',
          postedAt: null,
        });
      });
      return jobs;
    })
  );
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

export async function scrapeJobsSubdomain(p: SearchParams) {
  return scrapeGenericCareersPage(p, 'Jobs Subdomain');
}
export async function scrapeCareersPages(p: SearchParams) {
  return scrapeGenericCareersPage(p, 'Careers Pages');
}
export async function scrapePeopleSubdomain(p: SearchParams) {
  return scrapeGenericCareersPage(p, 'People Subdomain');
}
export async function scrapeTalentSubdomain(p: SearchParams) {
  return scrapeGenericCareersPage(p, 'Talent Subdomain');
}
export async function scrapeOtherPages(p: SearchParams) {
  return scrapeGenericCareersPage(p, 'Other Pages');
}
