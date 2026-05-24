/**
 * Vercel serverless chat endpoint — self-contained (no cross-folder imports).
 */

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

const ROLE_GUIDES: Record<string, string> = {
  guest: `The user is a VISITOR (not logged in). Explain CSU OJT System, register at /register, login at /login.`,
  admin: `The user is an ADMIN managing users, students, companies, applications, and reports.`,
  coordinator: `The user is a COORDINATOR managing students, applications, requirements, announcements, evaluations.`,
  student: `The user is a STUDENT who can apply for OJT, submit daily logs at /student/logs, and upload requirements.`,
  supervisor: `The user is a SUPERVISOR who approves logs and evaluates students at /supervisor/evaluate.`,
};

function buildSystemPrompt(role: string, userName?: string): string {
  const greeting = userName ? `The user's name is ${userName}.` : '';
  const guide = ROLE_GUIDES[role] ?? ROLE_GUIDES.guest;
  return `You are the CSU OJT Assistant for Caraga State University On-the-Job Training System.
${greeting}
${guide}
Answer about this system and general knowledge. Use paths like /student/logs, /login, /register.
Never mention OpenRouter, API keys, or AI providers. Developer: Raminder Jangao.`;
}

interface ChatBody {
  messages?: { role: string; content: string }[];
  role?: string;
  userName?: string;
}

async function runChat(body: ChatBody, env: {
  OPENROUTER_API_KEY?: string;
  OPENROUTER_MODEL?: string;
  referer?: string;
}) {
  const apiKey = env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return { status: 503, error: 'Assistant is not configured. Add OPENROUTER_API_KEY in Vercel.' };
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return { status: 400, error: 'Message is required.' };
  }

  const role = body.role ?? 'guest';
  const sanitized = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .slice(-24)
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: String(m.content).slice(0, 4000),
    }));

  const upstream = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': env.referer ?? 'https://github.com/tanjiroakainu1/OJT-Management-System-AI',
      'X-Title': 'CSU OJT Assistant',
    },
    body: JSON.stringify({
      model: env.OPENROUTER_MODEL ?? 'google/gemini-2.0-flash-001',
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
    console.error('OpenRouter:', payload.error?.message);
    return { status: 502, error: 'The assistant could not respond right now.' };
  }

  const reply = payload.choices?.[0]?.message?.content?.trim();
  if (!reply) {
    return { status: 502, error: 'Empty response from assistant.' };
  }

  return { status: 200, reply };
}

/** Vercel Node.js handler */
export default async function handler(
  req: { method?: string; body?: ChatBody | string },
  res: {
    setHeader: (k: string, v: string) => void;
    status: (n: number) => { json: (o: object) => void; end: () => void };
  }
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    let body: ChatBody = {};
    if (typeof req.body === 'string') {
      body = JSON.parse(req.body) as ChatBody;
    } else if (req.body && typeof req.body === 'object') {
      body = req.body;
    }

    const result = await runChat(body, {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
      referer: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : undefined,
    });

    if ('error' in result && result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    return res.status(200).json({ reply: (result as { reply: string }).reply });
  } catch (err) {
    console.error('chat error', err);
    return res.status(500).json({ error: 'Something went wrong.' });
  }
}
