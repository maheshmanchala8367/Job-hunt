export interface AIOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
}

/**
 * Auto-detect provider, endpoint, and model from just the API key.
 *
 *   nvapi-...   → NVIDIA NIM     → meta/llama-3.1-70b-instruct
 *   AIza...     → Google Gemini  → gemini-2.0-flash
 *   sk-ant-...  → Anthropic      → claude-haiku-4-5
 *   gsk_...     → Groq           → llama-3.1-8b-instant
 *   sk-...      → OpenAI         → gpt-4o-mini
 *
 * Override via AI_API_BASE_URL / AI_MODEL env vars.
 */
function resolveConfig(apiKey: string) {
  const isNvidia    = apiKey.startsWith('nvapi-');
  const isGemini    = apiKey.startsWith('AIza');
  const isAnthropic = apiKey.startsWith('sk-ant-');
  const isGroq      = apiKey.startsWith('gsk_');

  const defaultBaseUrl = isAnthropic
    ? 'https://api.anthropic.com'
    : isGroq
    ? 'https://api.groq.com/openai/v1'
    : isGemini
    ? 'https://generativelanguage.googleapis.com/v1beta/openai'
    : isNvidia
    ? 'https://integrate.api.nvidia.com/v1'
    : 'https://api.openai.com/v1';

  const defaultModel = isAnthropic
    ? 'claude-haiku-4-5-20251001'
    : isGroq
    ? 'llama-3.1-8b-instant'
    : isGemini
    ? 'gemini-2.0-flash'
    : isNvidia
    ? 'meta/llama-3.1-70b-instruct'
    : 'gpt-4o-mini';

  const baseUrl = (process.env.AI_API_BASE_URL || defaultBaseUrl).replace(/\/$/, '');
  const model   = process.env.AI_MODEL || defaultModel;

  const isAnthropicEndpoint = isAnthropic || baseUrl.includes('anthropic.com');

  return { baseUrl, model, isAnthropicEndpoint };
}

export async function callAI(
  systemPrompt: string,
  userMessage: string,
  { temperature = 0.7, maxTokens = 4096, jsonMode = false }: AIOptions = {}
): Promise<string> {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) throw new Error('AI_API_KEY is not set. Add it to your .env file.');

  const { baseUrl, model, isAnthropicEndpoint } = resolveConfig(apiKey);

  // ── Anthropic ──────────────────────────────────────────────────────────────
  if (isAnthropicEndpoint) {
    const res = await fetch(`${baseUrl}/v1/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Anthropic error ${res.status}`);
    }
    const data = await res.json();
    return data.content[0].text;
  }

  // ── OpenAI-compatible (OpenAI, Gemini, Groq, Ollama…) ─────────────────────
  const body: Record<string, unknown> = {
    model,
    max_tokens: maxTokens,
    temperature,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user',   content: userMessage  },
    ],
  };
  if (jsonMode) body.response_format = { type: 'json_object' };

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `AI API error ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
}

export function parseAIJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\s*/m, '').replace(/\s*```$/m, '').trim();
  return JSON.parse(cleaned) as T;
}
