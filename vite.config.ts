import type { IncomingMessage } from 'http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { buildSystemPrompt } from './shared/systemPrompt';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function devChatApiPlugin(env: Record<string, string>): Plugin {
  return {
    name: 'dev-chat-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/chat')) {
          next();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method not allowed' }));
          return;
        }

        const apiKey = env.OPENROUTER_API_KEY;
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              error: 'Assistant is not configured. Add OPENROUTER_API_KEY to .env',
            })
          );
          return;
        }

        try {
          const raw = await readBody(req);
          const body = JSON.parse(raw) as {
            messages?: { role: string; content: string }[];
            role?: string;
            userName?: string;
          };

          const messages = (body.messages ?? [])
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .slice(-24)
            .map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: String(m.content).slice(0, 4000),
            }));

          const role = body.role ?? 'student';
          const systemPrompt = buildSystemPrompt(role, body.userName);
          const model = env.OPENROUTER_MODEL ?? 'google/gemini-2.0-flash-001';

          const upstream = await fetch(OPENROUTER_URL, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${apiKey}`,
              'Content-Type': 'application/json',
              'HTTP-Referer': 'http://localhost:5173',
              'X-Title': 'CSU OJT Assistant',
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'system', content: systemPrompt }, ...messages],
              max_tokens: 1024,
              temperature: 0.7,
            }),
          });

          const payload = (await upstream.json()) as {
            choices?: { message?: { content?: string } }[];
            error?: { message?: string };
          };

          res.setHeader('Content-Type', 'application/json');

          if (!upstream.ok) {
            res.statusCode = 502;
            res.end(
              JSON.stringify({
                error: 'The assistant could not respond right now. Please try again.',
              })
            );
            return;
          }

          const reply = payload.choices?.[0]?.message?.content;
          if (!reply) {
            res.statusCode = 502;
            res.end(JSON.stringify({ error: 'Empty response from assistant.' }));
            return;
          }

          res.statusCode = 200;
          res.end(JSON.stringify({ reply }));
        } catch {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Something went wrong. Please try again.' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), devChatApiPlugin(env)],
  };
});
