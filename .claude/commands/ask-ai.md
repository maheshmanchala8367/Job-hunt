Work on the Ask AI feature of the Job Hunt Toolkit.

Task: $ARGUMENTS

## Feature overview
Ask AI is a floating chat widget available on every dashboard page. It uses server-side API keys (no user credentials needed) and maintains conversation history within the session. It renders markdown responses and supports voice input.

## Architecture
```
AskAIPanel (floating widget) → POST /api/ask-ai/chat → callAI() → streamed or full response
                                                     (server-side AI_API_KEY from .env)
```

## Key files
| File | Purpose |
|---|---|
| `src/components/ask-ai/panel.tsx` | Floating chat UI, message history, voice input |
| `src/components/ask-ai/button.tsx` | Floating action button that opens the panel |
| `src/app/api/ask-ai/chat/route.ts` | API route — reads messages, calls AI, returns response |
| `src/lib/ai.ts` | `callAI()` — auto-detects provider from API key prefix |
| `src/app/layout.tsx` | Mounts `<AskAIPanel />` globally in the layout |

## API route behavior
- Reads `AI_API_KEY`, `AI_API_BASE_URL`, `AI_MODEL` from `process.env`
- Auto-detects provider from key prefix: `nvapi-` → NVIDIA NIM, `AIza` → Gemini, `sk-ant-` → Anthropic, `gsk_` → Groq, `sk-` → OpenAI
- Accepts `{ messages: { role, content }[] }` in request body
- Returns `{ reply: string }`
- On 429: returns clear "rate limit" message with wait guidance

## System prompt (in `/api/ask-ai/chat/route.ts`)
The AI is told it is a job search career advisor with expertise in:
- Resume writing and optimization
- Job search strategy
- Interview preparation
- Salary negotiation
- Career transitions
- Networking and LinkedIn optimization

## Environment variables
```
AI_API_KEY=       # Your API key (nvapi-, AIza, sk-ant-, gsk_, sk-)
AI_API_BASE_URL=  # Optional override (auto-detected from key)
AI_MODEL=         # Optional model override (auto-detected per provider)
```

## Improving the AI agent
Edit `src/app/api/ask-ai/chat/route.ts` and `src/components/ask-ai/panel.tsx`:

**High-impact improvements:**
- **Context awareness**: read the current page route from the request and inject page-specific context into the system prompt (e.g., on job-tracker page, AI knows user is tracking applications)
- **User profile injection**: fetch the user's saved resume and career goals from the DB and inject as context so advice is personalized
- **Memory across sessions**: store conversation history in the DB (linked to userId) so the AI remembers past conversations
- **Suggested prompts**: show pre-written prompt chips (e.g., "Review my resume", "Help me negotiate", "Generate cover letter") that auto-fill the input
- **Streaming responses**: switch to streaming (use `ReadableStream`) so long responses appear word-by-word
- **Tool use / function calling**: give the AI tools — search jobs, look up salary data, analyze a URL the user pastes
- **Resume-aware answers**: if user has uploaded a resume, automatically include extracted text in context
- **Follow-up suggestions**: after each AI response, show 3 suggested follow-up questions

## Common tasks
- **Change the system prompt**: edit the `systemPrompt` string in the API route
- **Add streaming**: replace `NextResponse.json({ reply })` with a `ReadableStream` response
- **Add conversation persistence**: create a `ChatHistory` model in Prisma and save messages
- **Add voice output**: use `window.speechSynthesis` to read AI responses aloud
- **Style the widget**: edit `src/components/ask-ai/panel.tsx` — it uses Tailwind classes
