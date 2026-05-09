import { SourceDef, SearchParams, SearchResult, SourceResult, ScrapedJob } from './types';
import { filterByTime, deduplicateJobs } from './utils';
import {
  scrapeRemotive, scrapeRemoteOk,
  scrapeHimalayas, scrapeWeWorkRemotely, scrapeLinkedInGuest,
  scrapeGreenhouse, scrapeLever, scrapeAshby, scrapeWorkable, scrapeBreezyHR,
  scrapeRecruitee, scrapeSmartRecruiters, scrapeJazzHR, scrapeTeamtailor,
  scrapeJobvite, scrapePinpoint, scrapeHomerun, scrapeDover, scrapeCareerPuck,
  scrapeIcims, scrapeWorkday, scrapeOracleCloud, scrapeAdp, scrapeRippling,
  scrapeGusto, scrapePaylocity, scrapeKeka, scrapeGem, scrapeTrakstar,
  scrapeCats, scrapeTalentReef, scrapeTriNetHire, scrapeFactorial,
  scrapeNotionCareers, scrapeYCombinator, scrapeWellfound, scrapeBuiltin,
  scrapeRemoteRocketship, scrapeGlassdoor,
  scrapeIndeed, scrapeDice, scrapeNaukri, scrapeFoundit,
  scrapeJobsSubdomain, scrapeCareersPages, scrapePeopleSubdomain,
  scrapeTalentSubdomain, scrapeOtherPages,
} from './implementations';

export const ALL_SOURCES: SourceDef[] = [
  // ── Public JSON APIs (always reliable) ──────────────────────────
  { id: 'remotive',       name: 'Remotive',         category: 'api',   scraper: scrapeRemotive },
  { id: 'remoteok',       name: 'Remote OK',        category: 'api',   scraper: scrapeRemoteOk },
  { id: 'himalayas',      name: 'Himalayas',        category: 'api',   scraper: scrapeHimalayas },

  // ── Job Boards / Aggregators ────────────────────────────────────
  { id: 'weworkremotely', name: 'We Work Remotely', category: 'board', scraper: scrapeWeWorkRemotely },
  { id: 'yc',             name: 'Y Combinator',     category: 'board', scraper: scrapeYCombinator },
  { id: 'wellfound',      name: 'Wellfound',        category: 'board', scraper: scrapeWellfound },
  { id: 'builtin',        name: 'Builtin',          category: 'board', scraper: scrapeBuiltin },
  { id: 'remoterocketship', name: 'Remote Rocketship', category: 'board', scraper: scrapeRemoteRocketship },
  { id: 'linkedin',       name: 'LinkedIn',         category: 'board', scraper: scrapeLinkedInGuest },
  { id: 'glassdoor',      name: 'Glassdoor',        category: 'board', scraper: scrapeGlassdoor },
  { id: 'indeed',         name: 'Indeed',           category: 'board', scraper: scrapeIndeed },
  { id: 'dice',           name: 'Dice',             category: 'board', scraper: scrapeDice },
  { id: 'naukri',         name: 'Naukri',           category: 'board', scraper: scrapeNaukri },
  { id: 'foundit',        name: 'Foundit',          category: 'board', scraper: scrapeFoundit },

  // ── ATS Boards (auto-use seed list, no company slug needed) ─────
  { id: 'greenhouse',      name: 'Greenhouse',      category: 'ats', scraper: scrapeGreenhouse },
  { id: 'lever',           name: 'Lever',           category: 'ats', scraper: scrapeLever },
  { id: 'ashby',           name: 'Ashby',           category: 'ats', scraper: scrapeAshby },
  { id: 'workable',        name: 'Workable',        category: 'ats', scraper: scrapeWorkable },
  { id: 'breezyhr',        name: 'BreezyHR',        category: 'ats', scraper: scrapeBreezyHR },
  { id: 'recruitee',       name: 'Recruitee',       category: 'ats', scraper: scrapeRecruitee },
  { id: 'smartrecruiters', name: 'SmartRecruiters', category: 'ats', scraper: scrapeSmartRecruiters },
  { id: 'jazzhr',          name: 'JazzHR',          category: 'ats', scraper: scrapeJazzHR },
  { id: 'teamtailor',      name: 'Teamtailor',      category: 'ats', scraper: scrapeTeamtailor },
  { id: 'jobvite',         name: 'Jobvite',         category: 'ats', scraper: scrapeJobvite },
  { id: 'icims',           name: 'iCIMS',           category: 'ats', scraper: scrapeIcims },
  { id: 'pinpoint',        name: 'Pinpoint',        category: 'ats', scraper: scrapePinpoint },
  { id: 'homerun',         name: 'Homerun',         category: 'ats', scraper: scrapeHomerun },
  { id: 'dover',           name: 'Dover',           category: 'ats', scraper: scrapeDover },

  // ── Enterprise ATS (need company-specific URLs added by user) ───
  { id: 'workday',    name: 'Workday',           category: 'ats', scraper: scrapeWorkday,       requiresCompanyName: true },
  { id: 'oracle',     name: 'Oracle Cloud',      category: 'ats', scraper: scrapeOracleCloud,   requiresCompanyName: true },
  { id: 'adp',        name: 'ADP',               category: 'ats', scraper: scrapeAdp,           requiresCompanyName: true },
  { id: 'rippling',   name: 'Rippling',          category: 'ats', scraper: scrapeRippling,      requiresCompanyName: true },
  { id: 'gusto',      name: 'Gusto',             category: 'ats', scraper: scrapeGusto,         requiresCompanyName: true },
  { id: 'paylocity',  name: 'Paylocity',         category: 'ats', scraper: scrapePaylocity,     requiresCompanyName: true },
  { id: 'keka',       name: 'Keka',              category: 'ats', scraper: scrapeKeka,          requiresCompanyName: true },
  { id: 'gem',        name: 'Gem',               category: 'ats', scraper: scrapeGem,           requiresCompanyName: true },
  { id: 'trakstar',   name: 'Trakstar',          category: 'ats', scraper: scrapeTrakstar,      requiresCompanyName: true },
  { id: 'cats',       name: 'CATS',              category: 'ats', scraper: scrapeCats,          requiresCompanyName: true },
  { id: 'talentreef', name: 'TalentReef',        category: 'ats', scraper: scrapeTalentReef,    requiresCompanyName: true },
  { id: 'trinet',     name: 'TriNet Hire',       category: 'ats', scraper: scrapeTriNetHire,    requiresCompanyName: true },
  { id: 'factorial',  name: 'Factorial',         category: 'ats', scraper: scrapeFactorial,     requiresCompanyName: true },
  { id: 'careerpuck', name: 'CareerPuck',        category: 'ats', scraper: scrapeCareerPuck,    requiresCompanyName: true },
  { id: 'notion',     name: 'Notion',            category: 'ats', scraper: scrapeNotionCareers, requiresCompanyName: true },

  // ── Generic career-page patterns (user provides URLs) ───────────
  { id: 'jobs-subdomain',   name: 'Jobs Subdomain',   category: 'generic', scraper: scrapeJobsSubdomain,   requiresCompanyName: true },
  { id: 'careers-pages',    name: 'Careers Pages',    category: 'generic', scraper: scrapeCareersPages,    requiresCompanyName: true },
  { id: 'people-subdomain', name: 'People Subdomain', category: 'generic', scraper: scrapePeopleSubdomain, requiresCompanyName: true },
  { id: 'talent-subdomain', name: 'Talent Subdomain', category: 'generic', scraper: scrapeTalentSubdomain, requiresCompanyName: true },
  { id: 'other-pages',      name: 'Other Pages',      category: 'generic', scraper: scrapeOtherPages,      requiresCompanyName: true },
];

export const SOURCE_MAP = new Map(ALL_SOURCES.map((s) => [s.id, s]));

export async function searchJobs(params: SearchParams): Promise<SearchResult> {
  const searchedAt = new Date();

  // Determine which sources to run
  const toRun = params.sources?.length
    ? ALL_SOURCES.filter((s) => params.sources!.includes(s.id))
    : ALL_SOURCES;

  // Run all scrapers in parallel, capped per-source with a timeout
  const settled = await Promise.allSettled(
    toRun.map(async (source): Promise<SourceResult> => {
      const start = Date.now();
      try {
        const jobs = await Promise.race([
          source.scraper(params),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Scraper timeout')), 12_000)
          ),
        ]);
        return { sourceId: source.id, sourceName: source.name, jobs, durationMs: Date.now() - start };
      } catch (err) {
        return {
          sourceId: source.id,
          sourceName: source.name,
          jobs: [],
          error: err instanceof Error ? err.message : String(err),
          durationMs: Date.now() - start,
        };
      }
    })
  );

  const sources: SourceResult[] = settled.map((r) =>
    r.status === 'fulfilled' ? r.value : { sourceId: '', sourceName: '', jobs: [], error: String(r.reason), durationMs: 0 }
  );

  let allJobs: ScrapedJob[] = sources.flatMap((s) => s.jobs);
  const totalCount = allJobs.length;

  // Deduplicate only — no keyword or location post-filtering.
  // Each scraper passes the query directly to the source API/site;
  // relevance is the responsibility of each source, not the orchestrator.
  allJobs = deduplicateJobs(allJobs);

  // Only filter by time when the user explicitly picks a time window
  allJobs = filterByTime(allJobs, params.sinceHours);

  // Sort: newest first, nulls at end
  allJobs.sort((a, b) => {
    if (!a.postedAt && !b.postedAt) return 0;
    if (!a.postedAt) return 1;
    if (!b.postedAt) return -1;
    return b.postedAt.getTime() - a.postedAt.getTime();
  });

  return { jobs: allJobs, sources, totalCount, filteredCount: allJobs.length, searchedAt };
}

export type { ScrapedJob, SearchParams, SearchResult, SourceResult, SourceDef };
