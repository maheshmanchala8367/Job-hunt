Add more company slugs to the ATS seed lists so those boards auto-fetch jobs without the user supplying company names.

Companies or platform to add: $ARGUMENTS

## What you must do

1. **Identify the correct ATS platform** for each company (Greenhouse, Lever, Ashby, Workable, BreezyHR, Recruitee, SmartRecruiters, JazzHR, Teamtailor, Pinpoint, Homerun)

2. **Find the slug** for each company:
   - **Greenhouse**: slug is in `https://boards.greenhouse.io/<slug>/jobs.json`
   - **Lever**: slug is in `https://api.lever.co/v0/postings/<slug>`
   - **Ashby**: slug is in `https://api.ashbyhq.com/posting-api/job-board/<slug>`
   - **Workable**: slug is in `https://apply.workable.com/<slug>/`
   - **BreezyHR**: slug is in `https://<slug>.breezy.hr/json`
   - **Recruitee**: slug is in `https://<slug>.recruitee.com/api/offers/`
   - **SmartRecruiters**: slug is the company identifier in their API
   - Verify the slug works by fetching the URL and checking for valid JSON with job data

3. **Add verified slugs** to `src/lib/scrapers/company-seeds.ts`
   - Find the correct `ALL_SEEDS` key (GREENHOUSE, LEVER, ASHBY, etc.)
   - Append slugs alphabetically within their group
   - Only add slugs you have verified return valid data

4. **TypeScript check** — run `npx tsc --noEmit --skipLibCheck`

5. **Commit** with message: `feat: add <Company> slugs to <Platform> seeds`

## Key file
- `src/lib/scrapers/company-seeds.ts` — ALL_SEEDS object with platform seed arrays

## Verification tip
Test a slug before adding: `curl https://boards.greenhouse.io/<slug>/jobs.json | head -c 500`
