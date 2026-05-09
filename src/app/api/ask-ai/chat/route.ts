import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { buildSystemPrompt, type AppSection } from '@/lib/build-system-prompt';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { messages, section, dataSnapshot } = await req.json();
  if (!messages?.length) return NextResponse.json({ error: 'No messages provided.' }, { status: 400 });

  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'AI_API_KEY is not configured in .env' }, { status: 503 });
  }

  const isGemini    = apiKey.startsWith('AIza');
  const isAnthropic = apiKey.startsWith('sk-ant-');
  const isGroq      = apiKey.startsWith('gsk_');

  const baseUrl = (process.env.AI_API_BASE_URL || (
    isAnthropic ? 'https://api.anthropic.com'
    : isGroq    ? 'https://api.groq.com/openai/v1'
    : isGemini  ? 'https://generativelanguage.googleapis.com/v1beta/openai'
                : 'https://api.openai.com/v1'
  )).replace(/\/$/, '');

  const model = process.env.AI_MODEL || (
    isAnthropic ? 'claude-haiku-4-5-20251001'
    : isGroq    ? 'llama-3.1-8b-instant'
    : isGemini  ? 'gemini-2.0-flash'
                : 'gpt-4o-mini'
  );

  const systemPrompt = buildSystemPrompt({
    section: (section as AppSection) || 'general',
    dataSnapshot,
  });

  const lastMessage = messages[messages.length - 1].content as string;
  const history = messages.slice(0, -1)
    .map((m: { role: string; content: string }) =>
      `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');
  const userMessage = history
    ? `Previous conversation:\n${history}\n\nUser: ${lastMessage}`
    : lastMessage;

  try {
    let res: Response;

    if (isAnthropic || baseUrl.includes('anthropic.com')) {
      res = await fetch(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model, max_tokens: 1500,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });
    } else {
      res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model, max_tokens: 1500,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user',   content: userMessage  },
          ],
        }),
      });
    }

    // 429 — rate limited. Gemini free tier resets after 60 s; retrying immediately won't help.
    if (res.status === 429) {
      const retryAfter = res.headers.get('retry-after') || res.headers.get('x-ratelimit-reset-requests');
      const waitSec = retryAfter ? parseInt(retryAfter) : 60;
      return NextResponse.json(
        { error: `Rate limit reached. Please wait ${waitSec} seconds before sending another message. (Gemini free tier: 15 requests/min)` },
        { status: 429 }
      );
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `API error ${res.status}`);
    }

    const data = await res.json();
    const content = (isAnthropic || baseUrl.includes('anthropic.com'))
      ? data.content?.[0]?.text
      : data.choices?.[0]?.message?.content;

    if (!content) throw new Error('Empty response from AI.');
    return NextResponse.json({ content });

  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI call failed.';
    console.error('[ask-ai/chat]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
