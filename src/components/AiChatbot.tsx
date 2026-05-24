import { FormEvent, useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { type ChatAudience, type ChatMessage, QUICK_PROMPTS } from '../lib/assistantContext';
import { sendChatMessage } from '../lib/chatApi';

function TypingDots() {
  return (
    <span className="inline-flex gap-1 items-center h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

function getWelcomeMessage(audience: ChatAudience, firstName?: string): string {
  if (audience === 'guest') {
    return `Welcome to **CSU OJT**! I'm your assistant. Ask about this system, how to register or login, or anything else you'd like to know.`;
  }
  const hi = firstName ? `Hi ${firstName}!` : 'Hi!';
  return `${hi} I'm your **CSU OJT Assistant**. Ask me anything about this system or general topics — I'm here to help.`;
}

export default function AiChatbot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const audience: ChatAudience = user?.role ?? 'guest';
  const firstName = user?.full_name?.split(' ')[0];

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: getWelcomeMessage(audience, firstName) }]);
    }
  }, [open, messages.length, audience, firstName]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const prompts = QUICK_PROMPTS[audience];

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setError('');
    const userMsg: ChatMessage = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const history = nextMessages.filter((m) => m.role === 'user' || m.role === 'assistant');
      const reply = await sendChatMessage(history, audience, user?.full_name);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not reach the assistant.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  const clearChat = () => {
    setError('');
    setMessages([
      {
        role: 'assistant',
        content:
          audience === 'guest'
            ? 'Chat cleared. What would you like to know about CSU OJT?'
            : `Chat cleared. How can I help you today${firstName ? `, ${firstName}` : ''}?`,
      },
    ]);
  };

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[2px] sm:hidden"
          aria-label="Close assistant"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={`fixed z-[60] flex flex-col overflow-hidden border border-violet-500/40 bg-[#0b0a1a]/98 shadow-[0_0_48px_rgba(168,85,247,0.35)] backdrop-blur-xl transition-all duration-300 ease-out
          bottom-0 right-0 left-0 max-h-[85vh] rounded-t-3xl
          sm:bottom-24 sm:right-6 sm:left-auto sm:w-[400px] sm:max-h-[min(640px,75vh)] sm:rounded-2xl
          ${open ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-8 opacity-0 pointer-events-none sm:translate-y-4'}`}
        role="dialog"
        aria-label="CSU OJT Assistant"
        aria-hidden={!open}
      >
        <div className="relative shrink-0 border-b border-violet-500/30 bg-gradient-to-r from-[#1a1535] via-[#221b4a] to-[#1a1535] px-4 py-3">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(232,121,249,0.15),transparent_50%)] pointer-events-none" />
          <div className="relative flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] via-[#e879f9] to-[#f472b6] text-xl shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              ✨
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-[#f5f3ff] text-sm leading-tight">
                CSU OJT Assistant
              </h2>
              <p className="text-[11px] text-violet-400/90 truncate">
                {audience === 'guest'
                  ? 'Ask before you sign in'
                  : 'System help & general questions'}
              </p>
            </div>
            <div className="flex gap-1 shrink-0">
              <button
                type="button"
                onClick={clearChat}
                className="rounded-lg p-1.5 text-violet-400 hover:bg-violet-500/20 hover:text-violet-200 transition text-xs"
                title="Clear chat"
              >
                ↺
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-violet-400 hover:bg-violet-500/20 hover:text-violet-200 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div
          ref={listRef}
          className="flex-1 overflow-y-auto px-3 py-4 space-y-3 min-h-[200px] max-h-[45vh] sm:max-h-[380px]"
        >
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                  m.role === 'user'
                    ? 'bg-gradient-to-br from-[#7c3aed] to-[#a855f7] text-white rounded-br-md shadow-[0_0_16px_rgba(168,85,247,0.25)]'
                    : 'bg-[#1a1535] border border-violet-500/25 text-violet-100 rounded-bl-md'
                }`}
              >
                {m.content.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
                  part.startsWith('**') && part.endsWith('**') ? (
                    <strong key={j} className="font-semibold text-[#f5f3ff]">
                      {part.slice(2, -2)}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  )
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-[#1a1535] border border-violet-500/25 px-4 py-3">
                <TypingDots />
              </div>
            </div>
          )}
        </div>

        {error && <p className="shrink-0 px-4 pb-2 text-xs text-pink-300">{error}</p>}

        {!loading && (
          <div className="shrink-0 px-3 pb-2 flex flex-wrap gap-1.5">
            {prompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => send(p)}
                className="rounded-full border border-violet-500/30 bg-[#12102a]/90 px-2.5 py-1 text-[11px] text-violet-300 hover:border-fuchsia-400/50 hover:text-fuchsia-200 transition"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="shrink-0 border-t border-violet-500/30 bg-[#12102a]/90 p-3"
        >
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              rows={1}
              placeholder="Ask anything..."
              className="input-dark flex-1 resize-none min-h-[42px] max-h-28 text-sm py-2.5"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="shrink-0 flex h-[42px] w-[42px] items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#e879f9] text-white disabled:opacity-40 shadow-[0_0_16px_rgba(168,85,247,0.35)] hover:scale-105 active:scale-95 transition"
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
          <p className="text-[10px] text-violet-500/60 mt-2 text-center">
            Private assistant · answers may be AI-generated
          </p>
        </form>
      </div>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`fixed z-[60] bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-400/50 bg-gradient-to-br from-[#7c3aed] via-[#a855f7] to-[#e879f9] text-2xl text-white shadow-[0_0_32px_rgba(168,85,247,0.5)] transition-all duration-300 hover:scale-110 active:scale-95
          ${open ? 'scale-90 sm:scale-100' : 'animate-pulseGlow'}`}
        aria-label={open ? 'Close assistant' : 'Open CSU OJT Assistant'}
        aria-expanded={open}
      >
        {open ? '✕' : '✨'}
      </button>
    </>
  );
}
