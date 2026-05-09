# Job Hunt Toolkit — Setup Guide

## Prerequisites
- Node.js 18+
- PostgreSQL database (local or hosted, e.g. Supabase, Neon, Railway)

## 1. Install dependencies

```bash
cd job-hunt-toolkit
npm install
```

## 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | `http://localhost:3000` in development |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | Optional — from Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | Optional — from Google Cloud Console |
| `NEXT_PUBLIC_GOOGLE_ENABLED` | `true` to show Google sign-in button |
| `AI_API_KEY` | For Resume Match, Rewriter, Interview Prep |
| `AI_API_BASE_URL` | OpenAI-compatible endpoint |
| `AI_MODEL` | Model name, e.g. `gpt-4o` |

## 3. Set up the database

```bash
npm run db:push       # Push schema (development)
# or
npm run db:migrate    # Create migration files (recommended for production)
```

## 4. Run the development server

```bash
npm run dev
```

Open http://localhost:3000

---

## Features

| Tool | Description |
|---|---|
| **Job Search** | Real-time scraping from 38+ sources (Greenhouse, Lever, Ashby, LinkedIn, Wellfound, YC, Remote OK, Remotive, Arbeitnow, and 29 more). Time filters: 4h / 8h / 12h / 24h / week. |
| **Job Tracker** | Full application pipeline with charts, import/export CSV, interview round tracking, and follow-up reminders. |
| **Resume Match** | Upload PDF/DOCX or paste text. AI returns ATS score, missing keywords, bullet rewrites, skill gaps with learning resources. |
| **Resume Rewriter** | AI tailors your summary, adds targeted bullets, and flags missing skills — never invents experience. |
| **Interview Prep** | AI-generated questions by type/role/difficulty. Voice input, AI feedback (STAR analysis, score, model answer), session history. |
| **Ask AI** | Floating widget on every page. Uses your own API key (stored in browser, never our servers). Context-aware per section. |

## Job Search — ATS company boards

For Greenhouse, Lever, Ashby, Workable, etc., the Job Search page has a **Target company slugs** field. Enter company slugs (e.g. `stripe`, `airbnb`) and the scraper will check those specific company boards.

## AI Integration

Three options for `AI_API_BASE_URL`:

- **OpenAI**: `https://api.openai.com/v1` (model: `gpt-4o`)
- **Anthropic**: `https://api.anthropic.com` (model: `claude-sonnet-4-6`)
- **Ollama (local)**: `http://localhost:11434/v1` (model: `llama3`)

The **Ask AI widget** uses a separate user-supplied key entered via the in-app settings modal — it calls the AI directly from the browser.

## Google OAuth setup (optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI
4. Set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXT_PUBLIC_GOOGLE_ENABLED=true`
