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
    throw new Error(data.error ?? 'The assistant is temporarily unavailable. Please try again.');
  }

  if (!data.reply?.trim()) {
    throw new Error('No response received. Please try again.');
  }

  return data.reply.trim();
}
