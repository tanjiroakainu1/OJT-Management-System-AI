import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { UNIVERSITY } from '../../lib/meta';

interface AuthShellProps {
  variant: 'login' | 'register';
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const PANEL_CONTENT = {
  login: {
    badge: 'Welcome back',
    headline: 'Sign in to your OJT hub',
    blurb: 'Track applications, daily logs, requirements, and evaluations — all in one place.',
    features: [
      { icon: '📊', text: 'Role-based dashboards & reports' },
      { icon: '📝', text: 'Daily logs & supervisor approvals' },
      { icon: '🎓', text: 'Student OJT journey from apply to finish' },
    ],
  },
  register: {
    badge: 'Join as a student',
    headline: 'Start your OJT journey',
    blurb: 'Create your account in minutes and connect with partner companies through CSU.',
    features: [
      { icon: '✨', text: 'Free student registration' },
      { icon: '🏢', text: 'Apply to partner companies' },
      { icon: '📎', text: 'Upload requirements & track progress' },
    ],
  },
};

export function AuthShell({ variant, title, subtitle, children, footer }: AuthShellProps) {
  const panel = PANEL_CONTENT[variant];
  const alternate =
    variant === 'login'
      ? { label: 'New here?', cta: 'Create student account', to: '/register' }
      : { label: 'Have an account?', cta: 'Sign in', to: '/login' };

  return (
    <div className="auth-page w-full max-w-5xl mx-auto px-3 sm:px-4 min-w-0">
      <div className="auth-card-grid grid lg:grid-cols-5 gap-0 lg:gap-0 overflow-hidden rounded-3xl border border-violet-500/35 shadow-[0_0_60px_rgba(168,85,247,0.2)]">
        {/* Brand panel */}
        <div className="auth-panel hidden lg:flex lg:col-span-2 flex-col justify-between p-8 relative overflow-hidden">
          <div className="auth-orb auth-orb-1" />
          <div className="auth-orb auth-orb-2" />
          <div className="relative z-10">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm text-violet-300 hover:text-fuchsia-300 transition mb-8"
            >
              ← Back to home
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300/90 font-semibold mb-2">
              {panel.badge}
            </p>
            <h2 className="text-2xl font-bold font-display text-[#f5f3ff] leading-tight mb-3">
              {panel.headline}
            </h2>
            <p className="text-sm text-violet-300/90 leading-relaxed">{panel.blurb}</p>
          </div>
          <ul className="relative z-10 space-y-3 mt-8">
            {panel.features.map((f) => (
              <li
                key={f.text}
                className="flex items-center gap-3 rounded-xl border border-violet-500/20 bg-[#0b0a1a]/40 px-3 py-2.5 text-sm text-violet-100/90"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/20 text-lg">
                  {f.icon}
                </span>
                {f.text}
              </li>
            ))}
          </ul>
          <p className="relative z-10 text-xs text-violet-500/80 mt-8">{UNIVERSITY}</p>
        </div>

        {/* Form panel */}
        <div className="lg:col-span-3 bg-[#1a1535]/95 backdrop-blur-sm p-5 sm:p-8 relative min-w-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(232,121,249,0.08),transparent_50%)] pointer-events-none" />

          {/* Mobile header */}
          <div className="lg:hidden relative mb-6 text-center">
            <Link to="/" className="text-xs text-violet-400 hover:text-fuchsia-300 mb-3 inline-block">
              ← Home
            </Link>
            <p className="text-4xl mb-2 animate-float">✨</p>
            <p className="text-xs uppercase tracking-widest text-fuchsia-300/90 font-medium">
              {UNIVERSITY}
            </p>
          </div>

          <div className="relative">
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#f5f3ff]">{title}</h1>
            <p className="text-sm text-violet-300/90 mt-1 mb-6">{subtitle}</p>
            {children}
            {footer}
            <div className="mt-6 pt-5 border-t border-violet-500/20 text-center">
              <p className="text-sm text-violet-400/80">{alternate.label}</p>
              <Link
                to={alternate.to}
                className="inline-block mt-2 text-sm font-semibold text-fuchsia-300 hover:text-fuchsia-200 transition"
              >
                {alternate.cta} →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-violet-400/70 mt-6">
        Need help? Tap the <span className="text-fuchsia-300 font-medium">✨</span> assistant in the
        corner
      </p>
    </div>
  );
}

function PasswordStrength({ password, confirm }: { password: string; confirm: string }) {
  const checks = [
    { ok: password.length >= 6, label: 'At least 6 characters' },
    { ok: password.length >= 8, label: '8+ characters (stronger)' },
    { ok: confirm.length > 0 && password === confirm, label: 'Passwords match' },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-pink-500/60', 'bg-amber-500/60', 'bg-emerald-500/60'];

  return (
    <div className="mb-4 rounded-xl border border-violet-500/20 bg-[#12102a]/80 p-3">
      <div className="flex gap-1 mb-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all ${
              i < score ? colors[score - 1] : 'bg-violet-900/80'
            }`}
          />
        ))}
      </div>
      <ul className="space-y-1">
        {checks.map((c) => (
          <li
            key={c.label}
            className={`text-[11px] flex items-center gap-1.5 ${c.ok ? 'text-emerald-300' : 'text-violet-500/80'}`}
          >
            <span>{c.ok ? '✓' : '○'}</span>
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { PasswordStrength };
