Diagnose and fix a job scraper that is returning zero results, errors, or irrelevant jobs.

Scraper to debug: $ARGUMENTS

## Diagnostic steps — run in order

1. **Check the source result** in the browser
   - Open `/dashboard/job-search`, open DevTools → Network → look for `/api/jobs/search`
   - In the response JSON, find the `sources` array and locate the failing source
   - Note the `error` field and `jobs.length`

2. **Read the scraper function** in `src/lib/scrapers/implementations.ts`
   - Find `scrape<Name>` function
   - Identify the fetch URL and headers used

3. **Test the URL directly**
   - Run `curl -s "<url>" | head -c 1000` to see raw response
   - If it returns HTML instead of JSON → the endpoint changed or you're being blocked
   - If it returns 403/429 → rate limited or bot-blocked
   - If it returns empty array → no results for the query or slug is wrong

4. **Common fixes by symptom**

   | Symptom | Likely cause | Fix |
   |---|---|---|
   | `HTTP 403` | Bot blocking | Add realistic User-Agent header |
   | `HTTP 429` | Rate limited | Add delay or reduce request volume |
   | `HTTP 404` | URL changed | Find new endpoint via browser DevTools |
   | Empty jobs array | Query mismatch | Check how the scraper passes `p.query` to the API |
   | Wrong field names | API changed | Log raw response and update the interface type |
   | `__NEXT_DATA__` missing | Page structure changed | Update the JSON path traversal |
   | ATS returning 0 jobs | Bad company slug | Verify slug at the ATS URL directly |
   | Timeout | Slow source | Source is too slow — mark as low priority or remove |

5. **Fix the scraper** and run `npx tsc --noEmit --skipLibCheck` to confirm no type errors

6. **Commit** with message: `fix: <source-name> scraper — <one-line description of fix>`

## Key files
- `src/lib/scrapers/implementations.ts` — scraper functions
- `src/lib/scrapers/utils.ts` — safeFetch, safeJson (check timeout value here)
- `src/lib/scrapers/index.ts` — searchJobs timeout setting (currently 12 000 ms per source)
