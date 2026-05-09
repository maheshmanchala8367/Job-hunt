Add a new job board scraper to the Job Hunt Toolkit.

The user wants to add: $ARGUMENTS

## What you must do

1. **Research the source first**
   - Determine whether it has a public JSON API, RSS feed, or is HTML-only
   - Check if it is Next.js SSR (try `__NEXT_DATA__`) or static HTML
   - Identify the search URL pattern (what query params does it accept?)
   - Note any required request headers (User-Agent, Accept, app-specific headers)

2. **Add the scraper function** to `src/lib/scrapers/implementations.ts`
   - Export an `async function scrape<Name>(p: SearchParams): Promise<ScrapedJob[]>`
   - Use `safeJson` for JSON endpoints, `safeFetch` + cheerio for HTML
   - Always set `source`, `sourceCategory` (`'api'` | `'board'` | `'ats'` | `'generic'`), and `postedAt`
   - Slice results to ≤ 100 items
   - Wrap the whole body in try/catch — never let one scraper break others
   - Add a TypeScript interface for the raw API response shape

3. **Register it in `src/lib/scrapers/index.ts`**
   - Import the new function
   - Add a `SourceDef` entry to `ALL_SOURCES` in the correct category section

4. **Enable it in the UI** at `src/app/dashboard/job-search/page.tsx`
   - Add the source id to `ALL_PUBLIC_SOURCES` (if it needs no company slug)
   - Add `id: 'Display Name'` to `SOURCE_NAMES`

5. **If it is an ATS** (Greenhouse / Lever / Ashby style):
   - Add company slugs to `src/lib/scrapers/company-seeds.ts` under the right key
   - Use `atsForEachCompany` with the `seedKey` param

6. **TypeScript check** — run `npx tsc --noEmit --skipLibCheck` and fix all errors

7. **Commit** with message: `feat: add <Name> scraper`

## Key files
- `src/lib/scrapers/implementations.ts` — all scraper functions
- `src/lib/scrapers/index.ts` — ALL_SOURCES registry
- `src/lib/scrapers/company-seeds.ts` — ATS company slug lists
- `src/lib/scrapers/types.ts` — ScrapedJob, SearchParams types
- `src/lib/scrapers/utils.ts` — safeJson, safeFetch, makeId, shortHash helpers
- `src/app/dashboard/job-search/page.tsx` — ALL_PUBLIC_SOURCES, SOURCE_NAMES
