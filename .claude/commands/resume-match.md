Work on the Resume Match feature of the Job Hunt Toolkit.

Task: $ARGUMENTS

## Feature overview
Resume Match lets users paste a job description and upload their resume (PDF or DOCX). The AI scores the match (0–100), lists matched skills, missing skills, and key recommendations. Results are saved to the database.

## Architecture
```
page.tsx (upload + JD input) → /api/resume-match/analyze → AI (callAI) → score + analysis
                                                         → prisma.resumeAnalysis.create
                             → /api/resume-match/history → past analyses
```

## Key files
| File | Purpose |
|---|---|
| `src/app/dashboard/resume-match/page.tsx` | UI: file upload, JD textarea, score display |
| `src/app/api/resume-match/analyze/route.ts` | Extract text, call AI, save result |
| `src/app/api/resume-match/history/route.ts` | List past analyses for the user |
| `src/lib/ai.ts` | `callAI(prompt, systemPrompt?)` — provider-agnostic AI call |
| `src/lib/extract-text.ts` | PDF (pdf-parse) + DOCX (mammoth) text extraction |
| `prisma/schema.prisma` | ResumeAnalysis model |

## Database model (ResumeAnalysis)
```prisma
model ResumeAnalysis {
  id            String   @id @default(cuid())
  userId        String
  jobTitle      String?
  matchScore    Int
  matchedSkills Json     // string[]
  missingSkills Json     // string[]
  recommendations Json  // string[]
  createdAt     DateTime @default(now())
  user          User     @relation(...)
}
```

## AI prompt structure
The system prompt instructs the model to return **strict JSON** with this shape:
```json
{
  "matchScore": 78,
  "matchedSkills": ["React", "TypeScript", "REST APIs"],
  "missingSkills": ["GraphQL", "AWS"],
  "recommendations": [
    "Add 2 quantified AWS project bullets",
    "Mention GraphQL experience if applicable"
  ],
  "summary": "Strong frontend match, gaps in cloud infrastructure"
}
```

## Improving the AI agent
To make the analysis smarter, edit the system prompt in `src/app/api/resume-match/analyze/route.ts`:

**Current prompt improvements to consider:**
- Add industry-specific skill weighting (ML skills worth more for ML roles)
- Add ATS keyword density scoring (count exact keyword matches)
- Add section-by-section analysis (experience match, education match, skills match)
- Add "hidden requirements" detection (infer must-haves not explicitly stated in JD)
- Add culture-fit signals (remote-friendly, startup vs enterprise language)
- Request confidence levels per recommendation

## Text extraction
- PDF: `pdf-parse` library — text may lose formatting, handle gracefully
- DOCX: `mammoth` library — converts to plain text
- Max file size: controlled by `NEXT_PUBLIC_MAX_UPLOAD_MB` env var (default 5MB)

## Common tasks
- **Improve scoring**: refine the AI prompt to add weighted scoring by section
- **Add skill taxonomy**: pre-define skill categories so matched/missing groups by domain
- **Add visual breakdown**: add a radar chart (Recharts) showing scores by resume section
- **Fix extraction errors**: check `src/lib/extract-text.ts` for format-specific issues
