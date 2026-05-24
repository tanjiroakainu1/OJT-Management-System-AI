import { buildSystemPrompt } from './systemPrompt';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export interface ChatRequestBody {
  messages?: { role: string; content: string }[];
  role?: string;
  userName?: string;
}

export interface ChatEnv {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  APP_URL?: string;
}

export async function runChat(
  body: ChatRequestBody,
  env: ChatEnv
): Promise<{ ok: true; reply: string } | { ok: false; status: number; error: string }> {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      ok: false,
      status: 503,
      error: 'Assistant is not configured. Add OPENROUTER_API_KEY to environment variables.',
    };
  }

  const messages = body.messages ?? [];
  const role = body.role ?? 'guest';

  if (!Array.isArray(messages) || messages.length === 0) {
    return { ok: false, status: 400, error: 'Message is required.' };
  }

  const sanitized = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-24)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content).slice(0, 4000),
    }));

  const model = env.OPENROUTER_MODEL ?? 'google/gemini-2.0-flash-001';

  const upstream = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': env.APP_URL ?? 'https://ojt-management-system-ai.vercel.app',
      'X-Title': 'CSU OJT Assistant',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt(role, body.userName) },
        ...sanitized,
      ],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });

  const payload = (await upstream.json()) as {
    choices?: { message?: { content?: string } }[];
    error?: { message?: string };
  };

  if (!upstream.ok) {
    console.error('OpenRouter error:', payload.error?.message);
    return {
      ok: false,
      status: 502,
      error: 'The assistant could not respond right now. Please try again shortly.',
    };
  }

  const reply = payload.choices?.[0]?.message?.content;
  if (!reply?.trim()) {
    return { ok: false, status: 502, error: 'Empty response from assistant.' };
  }

  return { ok: true, reply: reply.trim() };
}
