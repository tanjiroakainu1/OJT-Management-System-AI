import { runChat, type ChatRequestBody } from './lib/chatCore';

export const config = {
  runtime: 'edge',
  regions: ['sin1', 'hnd1', 'iad1'],
};

function parseBody(raw: unknown): ChatRequestBody {
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as ChatRequestBody;
    } catch {
      return {};
    }
  }
  if (raw && typeof raw === 'object') {
    return raw as ChatRequestBody;
  }
  return {};
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const body = parseBody(await req.json());
    const result = await runChat(body, {
      OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
      OPENROUTER_MODEL: process.env.OPENROUTER_MODEL,
      APP_URL: process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.APP_URL,
    });

    if (!result.ok) {
      return Response.json({ error: result.error }, { status: result.status });
    }

    return Response.json({ reply: result.reply });
  } catch (err) {
    console.error('Chat handler error:', err);
    return Response.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
