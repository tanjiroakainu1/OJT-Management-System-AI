import type { ChatAudience, ChatMessage } from './assistantContext';

export async function sendChatMessage(
  messages: ChatMessage[],
  role: ChatAudience,
  userName?: string
): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, role, userName }),
  });

  const data = (await res.json().catch(() => ({}))) as {
    reply?: string;
    error?: string;
  };

  if (!res.ok) {
    if (res.status === 503) {
      throw new Error(
        data.error ??
          'AI assistant is not configured on the server. Add OPENROUTER_API_KEY in Vercel environment variables.'
      );
    }
    if (res.status === 404) {
      throw new Error(
        'Chat API not found. If deployed, ensure /api/chat is configured and redeploy.'
      );
    }
    throw new Error(data.error ?? 'The assistant is temporarily unavailable. Please try again.');
  }

  if (!data.reply?.trim()) {
    throw new Error('No response received. Please try again.');
  }

  return data.reply.trim();
}
