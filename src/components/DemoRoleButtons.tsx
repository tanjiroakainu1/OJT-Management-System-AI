import { DEMO_ACCOUNTS } from '../lib/seed';
import type { UserRole } from '../types';

const ROLE_META: Record<
  UserRole,
  { label: string; icon: string; border: string; bg: string; hover: string }
> = {
  admin: {
    label: 'Administrator',
    icon: '👑',
    border: 'border-fuchsia-500/40',
    bg: 'bg-fuchsia-950/40',
    hover: 'hover:border-fuchsia-400 hover:bg-fuchsia-950/70 hover:shadow-[0_0_20px_rgba(232,121,249,0.25)]',
  },
  coordinator: {
    label: 'Coordinator',
    icon: '📋',
    border: 'border-purple-500/40',
    bg: 'bg-purple-950/40',
    hover: 'hover:border-purple-400 hover:bg-purple-950/70 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)]',
  },
  student: {
    label: 'Student',
    icon: '🎓',
    border: 'border-violet-500/40',
    bg: 'bg-violet-950/40',
    hover: 'hover:border-violet-400 hover:bg-violet-950/70 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]',
  },
  supervisor: {
    label: 'Supervisor',
    icon: '🏢',
    border: 'border-cyan-500/40',
    bg: 'bg-cyan-950/30',
    hover: 'hover:border-cyan-400 hover:bg-cyan-950/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.2)]',
  },
};

interface DemoRoleButtonsProps {
  onSelect: (email: string, password: string) => void;
  onQuickLogin?: (email: string, password: string) => void | Promise<void>;
  loading?: boolean;
  activeEmail?: string;
  /** Show "Sign in as …" vs "Fill credentials" */
  quickLogin?: boolean;
}

export function DemoRoleButtons({
  onSelect,
  onQuickLogin,
  loading = false,
  activeEmail,
  quickLogin = false,
}: DemoRoleButtonsProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
      {DEMO_ACCOUNTS.map((account) => {
        const meta = ROLE_META[account.role];
        const isActive = activeEmail === account.email;

        return (
          <button
            key={account.email}
            type="button"
            disabled={loading}
            onClick={() => {
              onSelect(account.email, account.password);
              if (quickLogin && onQuickLogin) {
                void onQuickLogin(account.email, account.password);
              }
            }}
            className={`group flex flex-col items-start rounded-xl border p-3 sm:p-4 min-h-[88px] text-left transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation
              ${meta.border} ${meta.bg} ${meta.hover}
              ${isActive ? 'ring-2 ring-fuchsia-400/50 scale-[1.02]' : ''}`}
          >
            <span className="text-lg mb-1">{meta.icon}</span>
            <span className="text-sm font-semibold text-[#f5f3ff] leading-tight">
              {meta.label}
            </span>
            <span className="text-[10px] text-violet-400/80 mt-0.5 truncate w-full font-mono">
              {account.email}
            </span>
            <span className="text-[10px] text-fuchsia-300/70 mt-2 font-medium group-hover:text-fuchsia-200">
              {quickLogin ? 'Sign in →' : 'Use account →'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
