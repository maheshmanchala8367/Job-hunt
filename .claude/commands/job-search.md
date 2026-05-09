Work on the Job Search feature of the Job Hunt Toolkit.

Task: $ARGUMENTS

## Feature overview
The Job Search page aggregates live job listings from 30+ sources in parallel. Every source runs concurrently with a 12-second timeout. Results are deduplicated and sorted newest-first.

## Architecture
```
User types query → page.tsx → GET /api/jobs/search → searchJobs() → parallel scrapers
                                                                    ↓
                                                         deduplication + time filter
                                                                    ↓
                                                         sorted SearchResult JSON
```

## Key files
| File | Purpose |
|---|---|
| `src/app/dashboard/job-search/page.tsx` | UI, AutoInput autocomplete, source toggles, job cards |
| `src/app/api/jobs/search/route.ts` | API route — reads query params, calls searchJobs |
| `src/lib/scrapers/index.ts` | `searchJobs()` orchestrator, `ALL_SOURCES` registry |
| `src/lib/scrapers/implementations.ts` | Individual scraper functions |
| `src/lib/scrapers/company-seeds.ts` | ATS company slug lists |
| `src/lib/scrapers/utils.ts` | safeFetch, safeJson, makeId, shortHash, filterByTime, dedup |
| `src/lib/scrapers/types.ts` | ScrapedJob, SearchParams, SearchResult, SourceDef |
| `src/lib/world-locations.ts` | 400+ location autocomplete values |
| `src/lib/job-titles.ts` | 600+ job title autocomplete values |

## ScrapedJob shape
```typescript
{
  id: string;          // "source::externalId"
  title: string;
  company: string;
  location: string;
  url: string;
  source: string;      // display name
  sourceCategory: 'api' | 'board' | 'ats' | 'generic';
  postedAt: Date | null;
  salary?: string;
  jobType?: string;
  remote?: boolean;
  tags?: string[];
}
```

## Autocomplete behavior
- AutoInput filters with prefix-first ranking: exact → startsWith → includes
- Job titles: max 12 suggestions, from `JOB_TITLES` in `src/lib/job-titles.ts`
- Locations: max 10 suggestions, from `WORLD_LOCATIONS` in `src/lib/world-locations.ts`

## Adding a new source
Use the `/add-scraper` skill.

## Debugging a broken source
Use the `/debug-scraper` skill.

## Common tasks
- **Add job titles**: edit `src/lib/job-titles.ts`
- **Add locations**: edit `src/lib/world-locations.ts`
- **Add ATS companies**: use `/add-ats-companies` skill
- **Change per-source timeout**: edit the `12_000` value in `src/lib/scrapers/index.ts`
- **Change max suggestions**: edit `maxSuggestions` prop on `AutoInput` in `page.tsx`
