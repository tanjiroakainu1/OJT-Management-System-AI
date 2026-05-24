import type { IncomingMessage, ServerResponse } from 'http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { runChat } from './api/lib/chatCore';

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

function createChatMiddleware(env: Record<string, string>) {
  return async (
    req: IncomingMessage,
    res: ServerResponse,
    next: () => void
  ) => {
    const pathname = req.url?.split('?')[0];
    if (pathname !== '/api/chat') {
      next();
      return;
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.end();
      return;
    }

    if (req.method !== 'POST') {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    try {
      const raw = await readBody(req);
      const body = JSON.parse(raw) as {
        messages?: { role: string; content: string }[];
        role?: string;
        userName?: string;
      };

      const result = await runChat(body, {
        OPENROUTER_API_KEY: env.OPENROUTER_API_KEY,
        OPENROUTER_MODEL: env.OPENROUTER_MODEL,
        APP_URL: 'http://localhost:5173',
      });

      res.setHeader('Content-Type', 'application/json');

      if (!result.ok) {
        res.statusCode = result.status;
        res.end(JSON.stringify({ error: result.error }));
        return;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ reply: result.reply }));
    } catch {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Something went wrong. Please try again.' }));
    }
  };
}

function chatApiPlugin(env: Record<string, string>): Plugin {
  const middleware = createChatMiddleware(env);
  return {
    name: 'chat-api',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), chatApiPlugin(env)],
  };
});
