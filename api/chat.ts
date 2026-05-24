import type { VercelRequest, VercelResponse } from '@vercel/node';
import { buildSystemPrompt } from '../shared/systemPrompt';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'Assistant is not configured. Please contact the administrator.',
    });
  }

  try {
    const body = req.body as {
      messages?: { role: string; content: string }[];
      role?: string;
      userName?: string;
    };

    const messages = body.messages ?? [];
    const role = body.role ?? 'guest';

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    const sanitized = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-24)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: String(m.content).slice(0, 4000),
      }));

    const model =
      process.env.OPENROUTER_MODEL ?? 'google/gemini-2.0-flash-001';

    const upstream = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL ?? 'https://csu-ojt.vercel.app',
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
      console.error('Assistant upstream error', payload.error?.message);
      return res.status(502).json({
        error: 'The assistant could not respond right now. Please try again shortly.',
      });
    }

    const reply = payload.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: 'Empty response from assistant.' });
    }

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Chat handler error', err);
    return res.status(500).json({
      error: 'Something went wrong. Please try again.',
    });
  }
}
