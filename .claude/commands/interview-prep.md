Work on the Interview Prep feature of the Job Hunt Toolkit.

Task: $ARGUMENTS

## Feature overview
Interview Prep generates role-specific interview questions, evaluates user answers using AI, and tracks progress across sessions. Supports voice input via Web Speech API and saves sessions to the database.

## Architecture
```
page.tsx (question list + answer input + voice) → /api/interview-prep/generate → callAI → questions
                                               → /api/interview-prep/evaluate → callAI → feedback
                                               → /api/interview-prep/sessions → history
```

## Key files
| File | Purpose |
|---|---|
| `src/app/dashboard/interview-prep/page.tsx` | Full UI with voice input, question cards, feedback |
| `src/app/api/interview-prep/generate/route.ts` | Generate questions for role + stage |
| `src/app/api/interview-prep/evaluate/route.ts` | Evaluate a user's answer |
| `src/app/api/interview-prep/sessions/route.ts` | Save and list practice sessions |
| `src/lib/ai.ts` | `callAI()` |
| `prisma/schema.prisma` | InterviewSession model |

## Database model (InterviewSession)
```prisma
model InterviewSession {
  id          String   @id @default(cuid())
  userId      String
  role        String
  stage       String   // "phone" | "technical" | "behavioral" | "system-design" | "final"
  questions   Json     // { question: string, category: string, difficulty: string }[]
  answers     Json     // { questionId: string, answer: string, score: number, feedback: string }[]
  overallScore Int?
  createdAt   DateTime @default(now())
  user        User     @relation(...)
}
```

## Question generation prompt
The AI is asked to return **strict JSON**:
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "Tell me about a time you had to refactor a large codebase under time pressure.",
      "category": "behavioral",
      "difficulty": "medium",
      "hint": "Use the STAR method — focus on your decision-making process",
      "idealAnswer": "A strong answer covers: scope of the problem, your specific actions, measurable outcome"
    }
  ]
}
```

## Answer evaluation prompt
```json
{
  "score": 78,
  "strengths": ["Clear problem statement", "Quantified outcome"],
  "improvements": ["Missing: what specifically you did vs the team", "Add timeline"],
  "idealAnswer": "Strong answers to this question typically...",
  "followUpQuestions": ["How would you approach it differently now?"]
}
```

## Voice input (Web Speech API)
- Uses `window.SpeechRecognition || window.webkitSpeechRecognition`
- Ref typed as `{ stop: () => void } | null` (not `SpeechRecognition`) to avoid TypeScript build errors
- All window access is cast to `any` for Vercel compatibility

## Improving the AI agent
Edit the prompts in the API route files:

**High-impact improvements:**
- **Company-specific questions**: if user pastes JD, extract company name and generate questions tailored to that company's known interview style (e.g., Meta's behavioral emphasis, Google's LC focus)
- **Adaptive difficulty**: track scores across sessions and auto-increase difficulty when score > 80
- **Follow-up question chains**: after each answer, generate 1–2 follow-up questions to simulate real interview depth
- **Tone coaching**: evaluate not just content but communication clarity and confidence signals
- **Weak phrase detection**: flag filler words, passive constructions, and vague claims ("helped", "worked with", "maybe")
- **STAR completeness checker**: score each behavioral answer on Situation/Task/Action/Result completeness
- **Time awareness**: if user enables timer, factor response speed into coaching (interview pacing)
- **Industry-specific question banks**: hardcode known patterns (system design for senior engineers, PM metrics questions, etc.)

## Common tasks
- **Add new interview stage**: add to the stage selector in page.tsx + update generate prompt
- **Add flashcard mode**: flip-card UI for quick question review
- **Add session history chart**: show score trend across sessions with Recharts AreaChart
- **Add video mode**: integrate MediaRecorder to let users record and review their answers
