import { Link } from 'react-router-dom';
import type { Status, UserRole } from '../types';

export const tableCell = 'px-4 py-3 text-sm text-violet-100';
export const tableCellMuted = 'px-4 py-3 text-sm text-violet-300/70';
export const tableCellMedium = 'px-4 py-3 text-sm font-medium text-[#f5f3ff]';

const cardShell =
  'rounded-2xl border border-violet-500/30 bg-[#1a1535] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_1px_rgba(168,85,247,0.4)] overflow-hidden min-w-0';
const cardHeader =
  'px-4 py-3 border-b border-violet-500/25 bg-[#221b4a] font-semibold text-[#f5f3ff] tracking-wide';

export function PageHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-6 border-b border-violet-500/30 pb-4">
      <h1 className="page-title flex items-center gap-2">
        <span className="text-2xl animate-float">🍬</span>
        {title}
      </h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  );
}

export function Card({
  children,
  className = '',
  title,
}: {
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <div className={`${cardShell} ${className}`}>
      {title && <div className={`${cardHeader} font-display`}>{title}</div>}
      <div className="p-4 sm:p-5 text-violet-100/90 min-w-0 overflow-x-auto">{children}</div>
    </div>
  );
}

const statThemes: Record<string, string> = {
  purple: 'from-[#7c3aed] via-[#6d28d9] to-[#0b0a1a] border-violet-500/40',
  pink: 'from-[#db2777] via-[#be185d] to-[#0b0a1a] border-pink-500/40',
  mint: 'from-[#0891b2] via-[#0e7490] to-[#0b0a1a] border-cyan-500/40',
  grape: 'from-[#6d28d9] via-[#5b21b6] to-[#0b0a1a] border-purple-500/40',
  fuchsia: 'from-[#c026d3] via-[#a21caf] to-[#0b0a1a] border-fuchsia-500/40',
  shadow: 'from-[#312e81] via-[#1e1b4b] to-[#0b0a1a] border-indigo-500/40',
  void: 'from-[#1e1b4b] via-[#12102a] to-[#0b0a1a] border-violet-800/40',
  'bg-blue-600': 'from-[#7c3aed] via-[#6d28d9] to-[#0b0a1a] border-violet-500/40',
  'bg-green-600': 'from-emerald-800 via-emerald-950 to-[#0b0a1a] border-emerald-500/40',
  'bg-cyan-600': 'from-[#0891b2] via-[#0e7490] to-[#0b0a1a] border-cyan-500/40',
  'bg-amber-500': 'from-[#d97706] via-[#b45309] to-[#0b0a1a] border-amber-500/40',
  'bg-red-600': 'from-[#db2777] via-[#be185d] to-[#0b0a1a] border-pink-500/40',
  'bg-gray-600': 'from-[#312e81] via-[#1e1b4b] to-[#0b0a1a] border-indigo-500/40',
  'bg-gray-800': 'from-[#1e1b4b] via-[#12102a] to-[#0b0a1a] border-violet-800/40',
  blood: 'from-[#7c3aed] via-[#6d28d9] to-[#0b0a1a] border-violet-500/40',
  crimson: 'from-[#db2777] via-[#be185d] to-[#0b0a1a] border-pink-500/40',
  pumpkin: 'from-[#d97706] via-[#b45309] to-[#0b0a1a] border-amber-500/40',
  ember: 'from-[#c026d3] via-[#a21caf] to-[#0b0a1a] border-fuchsia-500/40',
};

export function StatCard({
  label,
  value,
  to,
  color = 'purple',
}: {
  label: string;
  value: number | string;
  to?: string;
  color?: string;
}) {
  const gradient = statThemes[color] ?? statThemes.purple;
  const content = (
    <div
      className={`bg-gradient-to-br ${gradient} text-[#f5f3ff] rounded-2xl border p-6 h-full flex flex-col shadow-[0_0_24px_rgba(168,85,247,0.35)] hover:shadow-[0_0_32px_rgba(232,121,249,0.4)] transition-all duration-300 hover:scale-[1.02]`}
    >
      <p className="text-sm uppercase tracking-widest text-violet-200/90 font-medium">{label}</p>
      <p className="text-3xl font-bold mt-2 font-display text-white drop-shadow-lg">{value}</p>
      {to && (
        <p className="text-sm mt-auto pt-4 text-fuchsia-200 group-hover:text-[#f472b6]">
          Explore → ✨
        </p>
      )}
    </div>
  );
  if (to) {
    return (
      <Link to={to} className="block group">
        {content}
      </Link>
    );
  }
  return content;
}

export function StatusBadge({ status }: { status: Status | string }) {
  const colors: Record<string, string> = {
    pending: 'bg-amber-950/90 text-amber-200 border-amber-600/60',
    approved: 'bg-emerald-950/90 text-emerald-200 border-emerald-600/60',
    rejected: 'bg-pink-950/90 text-pink-200 border-pink-600/60',
    active: 'bg-emerald-950/90 text-emerald-200 border-emerald-600/60',
    inactive: 'bg-violet-950/90 text-violet-300 border-violet-600/60',
  };
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${
        colors[status] ?? 'bg-violet-950/90 text-violet-300 border-violet-600/60'
      }`}
    >
      {status}
    </span>
  );
}

export function RoleBadge({ role }: { role: UserRole }) {
  const colors: Record<UserRole, string> = {
    admin: 'bg-fuchsia-950/90 text-fuchsia-200 border-fuchsia-600/60',
    coordinator: 'bg-purple-950/90 text-purple-200 border-purple-600/60',
    supervisor: 'bg-cyan-950/90 text-cyan-200 border-cyan-600/60',
    student: 'bg-violet-950/90 text-violet-200 border-violet-600/60',
  };
  return (
    <span
      className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize border ${colors[role]}`}
    >
      {role}
    </span>
  );
}

export function Alert({
  type = 'info',
  children,
}: {
  type?: 'success' | 'error' | 'info';
  children: React.ReactNode;
}) {
  const styles = {
    success: 'bg-emerald-950/80 border-emerald-600/50 text-emerald-100',
    error: 'bg-pink-950/80 border-pink-500/50 text-pink-100',
    info: 'bg-[#221b4a] border-violet-500/40 text-violet-100',
  };
  return (
    <div className={`border rounded-xl px-4 py-3 mb-4 ${styles[type]}`}>{children}</div>
  );
}

export function ButtonRow({
  children,
  className = '',
  align = 'start',
}: {
  children: React.ReactNode;
  className?: string;
  align?: 'start' | 'end' | 'between';
}) {
  const alignClass =
    align === 'end' ? 'justify-end' : align === 'between' ? 'justify-between' : '';
  return (
    <div className={`btn-row ${alignClass} ${className}`.trim()}>{children}</div>
  );
}

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}) {
  const sizes = {
    sm: 'min-h-[40px] px-3 py-1.5 text-xs',
    md: 'min-h-[44px] px-4 py-2 text-sm',
    lg: 'min-h-[48px] px-5 py-2.5 text-base',
  };
  const variants = {
    primary:
      'bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#e879f9] hover:from-[#a855f7] hover:via-[#e879f9] hover:to-[#f472b6] text-white border border-violet-400/40 shadow-[0_0_24px_rgba(168,85,247,0.35)]',
    secondary:
      'bg-[#12102a] hover:bg-[#221b4a] text-violet-100 border border-violet-500/30 hover:border-violet-400',
    danger:
      'bg-gradient-to-r from-pink-700 to-rose-600 hover:from-pink-600 hover:to-rose-500 text-white border border-pink-500/40',
    success:
      'bg-gradient-to-r from-emerald-800 to-emerald-700 hover:from-emerald-700 hover:to-emerald-600 text-white border border-emerald-600/40',
    warning:
      'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border border-amber-500/40',
  };
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center shrink-0 rounded-xl font-medium disabled:opacity-50 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] touch-manipulation ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

const inputClass =
  'w-full border border-violet-500/30 rounded-xl px-3 py-2 bg-[#12102a] text-[#f5f3ff] placeholder-violet-400/50 focus:ring-2 focus:ring-purple-500/40 focus:border-[#a855f7] transition-colors';

export function Input({
  label,
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-violet-300 mb-1">{label}</label>
      )}
      <input
        className={`${inputClass} ${error ? 'border-pink-500' : ''}`}
        {...props}
      />
      {error && <p className="text-pink-300 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function Select({
  label,
  error,
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: { value: string | number; label: string }[];
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-violet-300 mb-1">{label}</label>
      <select
        className={`${inputClass} ${error ? 'border-pink-500' : ''}`}
        {...props}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-[#12102a] text-[#f5f3ff]">
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="text-pink-300 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function Textarea({
  label,
  error,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-violet-300 mb-1">{label}</label>
      <textarea
        className={`${inputClass} ${error ? 'border-pink-500' : ''}`}
        rows={4}
        {...props}
      />
      {error && <p className="text-pink-300 text-sm mt-1">{error}</p>}
    </div>
  );
}

export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-violet-500/25">
      <table className="data-table min-w-full">
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-violet-400/70">
        {message}
      </td>
    </tr>
  );
}
