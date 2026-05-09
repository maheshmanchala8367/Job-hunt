Diagnose and fix a Vercel or local build failure in the Job Hunt Toolkit.

Error or symptom: $ARGUMENTS

## Step 1 — Identify the error type

Run locally first:
```
npx tsc --noEmit --skipLibCheck
npm run build
```

## Common errors and exact fixes

### TypeScript: `Cannot find name 'X'` (browser globals)
**Cause**: Browser APIs (SpeechRecognition, window, document, localStorage) are not available in Node.js build environment.
**Fix**: 
- Cast to `any`: `const SR: any = (window as any).SpeechRecognition`
- Type refs as generic: `useRef<{ stop: () => void } | null>(null)` instead of `useRef<SpeechRecognition | null>`
- Guard with: `if (typeof window === 'undefined') return;`

### ESLint: `react/no-unescaped-entities`
**Cause**: Apostrophes or quotes in JSX text (e.g., `don't`, `"text"`)
**Fix**: Already disabled in `.eslintrc.json` — if still appearing, check the file has:
```json
{ "extends": "next/core-web-vitals", "rules": { "react/no-unescaped-entities": "off" } }
```

### `X is not a valid Route export field`
**Cause**: Exported a non-standard function from an API route file.
**Fix**: Only export `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `HEAD`, `OPTIONS` from route files. Remove any other exports.

### `Cannot find module '@/lib/X'`
**Cause**: Import path is wrong or the file doesn't exist.
**Fix**: Check the file exists at `src/lib/X.ts`. Check `tsconfig.json` has `"paths": { "@/*": ["./src/*"] }`.

### `Unknown argument 'X'` (Prisma)
**Cause**: Prisma schema was changed but the API route still references old field names.
**Fix**: Re-read `prisma/schema.prisma` to find the current field names. Update the `prisma.modelName.create/update` call to match.
Then run `npx prisma generate`.

### `Environment variable not found: DATABASE_URL`
**Cause**: `.env` file missing or not loaded.
**Fix**: Ensure `.env` exists at project root (not `.env.example`). Add variables to Vercel dashboard under Project → Settings → Environment Variables.

### `ChunkLoadError` or stale build artifacts
**Cause**: Old `.next` build cache is corrupted.
**Fix**: 
```
Remove-Item -Recurse -Force .next   # PowerShell
npm run dev
```

### `Set<string> can only be iterated with --downlevelIteration` 
**Cause**: TypeScript target is too low for `new Set()` spread.
**Fix**: Either change `for...of` on Set to `Array.from(set).forEach(...)` or add `"downlevelIteration": true` to `tsconfig.json` compilerOptions.

### Prisma `P1001` / `P1002` (can't reach DB)
**Cause**: `DATABASE_URL` is wrong or Neon DB is paused.
**Fix**: Check Neon dashboard at `console.neon.tech` — copy the fresh connection string and update `.env` and Vercel env vars.

## After fixing
1. `npx tsc --noEmit --skipLibCheck` — must show zero errors (job-tracker Set errors are pre-existing, ignore them)
2. `npm run build` — must complete successfully
3. Commit and push → Vercel auto-deploys

## Vercel-specific
- Environment variables: Vercel → Project → Settings → Environment Variables
- Build logs: Vercel → Project → Deployments → click failed deployment → View Logs
- `NEXTAUTH_URL` must match the actual deployed URL (e.g., `https://your-app.vercel.app`)
