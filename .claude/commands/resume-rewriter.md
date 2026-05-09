Work on the Resume Rewriter feature of the Job Hunt Toolkit.

Task: $ARGUMENTS

## Feature overview
Resume Rewriter takes a user's resume and a job description, then uses AI to rewrite resume bullets to be more ATS-friendly, quantified, and aligned with the target role. It outputs a rewritten summary, improved bullet points, and updated skills section.

## Architecture
```
page.tsx (resume upload + JD input) → /api/resume-rewriter/rewrite → callAI → structured output
                                                                   → prisma.resumeRewrite.create
                                    → /api/resume-rewriter/history → past rewrites
```

## Key files
| File | Purpose |
|---|---|
| `src/app/dashboard/resume-rewriter/page.tsx` | Upload UI, before/after diff view, copy buttons |
| `src/app/api/resume-rewriter/rewrite/route.ts` | Extract text, call AI, save result |
| `src/app/api/resume-rewriter/history/route.ts` | List past rewrites |
| `src/lib/ai.ts` | `callAI()` — universal AI caller |
| `src/lib/extract-text.ts` | PDF + DOCX text extraction |
| `prisma/schema.prisma` | ResumeRewrite model |

## Database model (ResumeRewrite)
```prisma
model ResumeRewrite {
  id           String   @id @default(cuid())
  userId       String
  jobTitle     String?
  summary      String   // rewritten professional summary
  newBullets   Json     // { original: string, rewritten: string }[]
  updatedSkills Json    // string[] — skills to add/emphasize
  createdAt    DateTime @default(now())
  user         User     @relation(...)
}
```

## AI prompt structure
The system prompt asks for **strict JSON**:
```json
{
  "summary": "Results-driven software engineer with 5+ years...",
  "bullets": [
    {
      "original": "Worked on backend APIs",
      "rewritten": "Architected and shipped 12 REST APIs serving 2M daily requests, reducing p99 latency by 40%"
    }
  ],
  "skills": ["TypeScript", "System Design", "AWS Lambda"],
  "coverLetterHook": "Optional: one strong opening sentence for a cover letter"
}
```

## Improving the AI agent
Edit the system prompt in `src/app/api/resume-rewriter/rewrite/route.ts`:

**High-impact improvements:**
- **STAR framework enforcement**: rewrite each bullet as Situation → Task → Action → Result
- **Quantification injection**: if a bullet lacks numbers, ask AI to suggest plausible ranges and flag them for user review (e.g., "~30% improvement — verify with your manager")
- **ATS keyword stuffing prevention**: instruct AI to weave keywords naturally, not repeat verbatim
- **Tone matching**: detect JD tone (startup casual vs enterprise formal) and match in rewrites
- **Section-aware rewriting**: treat summary, experience bullets, and skills differently
- **Before/after explanation**: for each rewrite, explain WHY this version is stronger
- **Red flag detection**: flag weak verbs (Helped, Assisted, Worked on) and replace with power verbs
- **Length calibration**: target bullets at 1–2 lines (15–30 words), flag over/under

## Common tasks
- **Add diff view**: show original vs rewritten side-by-side with changed words highlighted
- **Add export**: generate a downloadable .docx of the rewritten resume
- **Add cover letter**: extend the prompt to output a full cover letter draft
- **Improve bullet scoring**: add a "before strength score" so users see the improvement
