Deploy the Job Hunt Toolkit to Vercel or troubleshoot a deployment issue.

Task: $ARGUMENTS

## Deployment checklist

### Before pushing
- [ ] `npx tsc --noEmit --skipLibCheck` — zero new errors
- [ ] `npm run build` — build succeeds locally
- [ ] No secrets committed (`.env` is in `.gitignore`)

### Git push → auto-deploy
```powershell
git add <files>
git commit -m "description"
git push
```
Vercel picks up the push and deploys automatically.

### Required Vercel environment variables
Set under: Vercel → Project → Settings → Environment Variables → Add

| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `NEXTAUTH_URL` | Your deployed URL: `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret (generate: `openssl rand -base64 32`) |
| `AI_API_KEY` | Your API key — model and provider are auto-detected from the key prefix |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | `false` (or `true` if Google OAuth is configured) |
| `NEXT_PUBLIC_MAX_UPLOAD_MB` | `5` |

**AI provider is auto-detected from your key** — no model name or base URL needed:
- `nvapi-*` key → automatically uses NVIDIA NIM
- `AIza*` key → automatically uses Google Gemini
- `sk-ant-*` key → automatically uses Anthropic Claude
- `gsk_*` key → automatically uses Groq
- `sk-*` key → automatically uses OpenAI

After adding/changing env vars: **Redeploy** (Vercel → Deployments → Redeploy).

### NEXTAUTH_URL must match exactly
`NEXTAUTH_URL` must be the exact Vercel URL including `https://` and NO trailing slash.
Wrong: `http://localhost:3000`, `https://your-app.vercel.app/`
Right: `https://your-app.vercel.app`

### Prisma on Vercel
Vercel builds run `prisma generate` via the `postinstall` script in `package.json`.
Check that `package.json` has:
```json
"scripts": {
  "postinstall": "prisma generate"
}
```
The Neon database must be accessible from Vercel's region. Neon works by default.

### Google OAuth (if enabling)
1. Go to Google Cloud Console → APIs & Services → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Add authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`
4. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in Vercel
5. Set `NEXT_PUBLIC_GOOGLE_ENABLED=true` in Vercel
6. Redeploy

### Viewing build logs
Vercel → Project → Deployments → click the failed deployment → "View Logs"
Look for the first red error — that's the root cause, not subsequent cascade errors.

### Common deployment failures
See `/fix-build` skill for detailed error fixes.

### After successful deployment
1. Visit your app URL and test: sign up, log in, job search, upload resume
2. Confirm NEXTAUTH_URL matches actual URL — auth will break if it doesn't
3. Check Neon dashboard — confirm queries are hitting the DB

## Local development
```powershell
npm run dev          # starts at localhost:3000
npx prisma studio    # opens DB GUI at localhost:5555
npx prisma migrate dev --name <description>  # apply schema changes
```
