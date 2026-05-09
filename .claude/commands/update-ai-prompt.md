Improve the AI prompt for a specific feature in the Job Hunt Toolkit.

Feature and improvement: $ARGUMENTS

## AI integration overview

All AI calls go through `src/lib/ai.ts`:
```ts
callAI(userPrompt: string, systemPrompt?: string): Promise<string>
```

The function auto-detects the provider from `AI_API_KEY`:
- `nvapi-*` → NVIDIA NIM (default: `meta/llama-3.1-70b-instruct`)
- `AIza*` → Google Gemini (default: `gemini-2.0-flash`)
- `sk-ant-*` → Anthropic Claude (default: `claude-haiku-4-5-20251001`)
- `gsk_*` → Groq (default: `llama-3.1-8b-instant`)
- `sk-*` → OpenAI (default: `gpt-4o-mini`)

## API routes with AI prompts
| Feature | Prompt location |
|---|---|
| Resume Match | `src/app/api/resume-match/analyze/route.ts` |
| Resume Rewriter | `src/app/api/resume-rewriter/rewrite/route.ts` |
| Interview Prep – generate | `src/app/api/interview-prep/generate/route.ts` |
| Interview Prep – evaluate | `src/app/api/interview-prep/evaluate/route.ts` |
| Ask AI | `src/app/api/ask-ai/chat/route.ts` |
| Negotiation Coach | `src/app/api/negotiation/analyze/route.ts` (to be built) |

## Prompt engineering rules for this app

**Always ask for strict JSON** — the API routes parse AI output as JSON:
```
Respond with ONLY valid JSON. No markdown code blocks, no explanation outside the JSON.
```

**Include the schema** in the system prompt — tell the AI exactly what shape to return.

**Be explicit about tone and scope** — the AI doesn't know this is a job-hunt app unless you tell it.

**Handle failure gracefully** — always wrap `JSON.parse(aiResponse)` in try/catch and return a sensible default.

## Prompt improvement checklist
- [ ] Is the output schema fully specified in the system prompt?
- [ ] Are all field names in the schema used by the parsing code?
- [ ] Does the prompt include a concrete example of ideal output?
- [ ] Does the prompt handle edge cases (empty resume, very short JD, unusual roles)?
- [ ] Is the tone instruction appropriate (professional, direct, constructive)?
- [ ] Is the user's raw input sanitized before injection into the prompt?
- [ ] Are there instructions to avoid hallucinating specific salary numbers without qualification?
- [ ] Is the response length appropriate for the model's context window?

## Testing a prompt change
1. Edit the system prompt string in the route file
2. Restart dev server: `npm run dev`
3. Test with several different inputs (short resume, long resume, technical role, non-tech role)
4. Check the raw AI output: add `console.log('AI raw:', rawResponse)` temporarily
5. Confirm JSON.parse succeeds for all test cases
6. Remove the console.log and commit

## Model-specific notes
- **NVIDIA NIM (Llama 70B)**: good JSON compliance, may need explicit "no markdown" instruction
- **Gemini Flash**: fast, occasionally wraps JSON in ```json ``` blocks — strip with regex if needed
- **Claude Haiku**: best JSON compliance, most instruction-following, slightly slower
- **Groq (Llama 8B)**: fastest but sometimes truncates long JSON — reduce output size if needed
- **GPT-4o-mini**: reliable JSON, good at structured output
