import { DEVELOPER, APP_SHORT_NAME, UNIVERSITY } from '../lib/meta';

interface AppFooterProps {
  /** Tighter layout for authenticated dashboard shell */
  compact?: boolean;
}

export function AppFooter({ compact = false }: AppFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={`shrink-0 border-t border-violet-500/30 bg-[#0b0a1a]/95 backdrop-blur-sm ${
        compact ? 'py-3' : 'py-5'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`flex flex-col items-center gap-3 text-center ${
            compact ? 'sm:flex-row sm:justify-between sm:text-left' : 'gap-4'
          }`}
        >
          <div className="min-w-0">
            <p className="text-sm text-violet-300/90">
              © {year}{' '}
              <span className="text-[#f5f3ff] font-medium">{UNIVERSITY}</span>
              {!compact && (
                <>
                  <br className="sm:hidden" />
                  <span className="hidden sm:inline"> · </span>
                  {APP_SHORT_NAME}
                </>
              )}
              {compact && <> · {APP_SHORT_NAME}</>}
            </p>
            <p className="text-xs text-violet-400/70 mt-0.5">
              On-the-Job Training Platform
            </p>
          </div>

          <DeveloperCredit variant={compact ? 'inline' : 'card'} />
        </div>
      </div>
    </footer>
  );
}

export function DeveloperCredit({
  variant = 'card',
}: {
  variant?: 'card' | 'inline' | 'hero';
}) {
  if (variant === 'inline') {
    return (
      <p className="text-xs text-violet-400/80 shrink-0">
        Built by{' '}
        <span className="font-semibold bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
          {DEVELOPER.name}
        </span>
      </p>
    );
  }

  if (variant === 'hero') {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/35 bg-gradient-to-br from-[#1a1535] via-[#221b4a] to-[#12102a] p-6 text-center shadow-[0_0_40px_rgba(168,85,247,0.25)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,121,249,0.2),transparent_55%)] pointer-events-none" />
        <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300/90 font-medium relative">
          ✨ System Developer
        </p>
        <div className="relative flex flex-col items-center mt-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#e879f9] to-[#f472b6] text-2xl font-bold text-white shadow-[0_0_32px_rgba(168,85,247,0.45)] ring-4 ring-fuchsia-400/30">
            {DEVELOPER.initials}
          </div>
          <h3 className="mt-4 text-2xl font-bold font-display bg-gradient-to-r from-[#f5f3ff] via-fuchsia-200 to-violet-200 bg-clip-text text-transparent">
            {DEVELOPER.name}
          </h3>
          <p className="text-sm text-violet-300 mt-1">{DEVELOPER.title}</p>
          <p className="text-xs text-violet-400/80 mt-2 max-w-xs">{DEVELOPER.tagline}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-violet-500/25 bg-[#12102a]/60 px-3 py-2 shrink-0">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c3aed] to-[#e879f9] text-xs font-bold text-white shadow-[0_0_12px_rgba(168,85,247,0.35)]">
        {DEVELOPER.initials}
      </div>
      <div className="text-left">
        <p className="text-[10px] uppercase tracking-wider text-violet-400/80">Developed by</p>
        <p className="text-sm font-semibold bg-gradient-to-r from-violet-200 via-fuchsia-200 to-pink-200 bg-clip-text text-transparent leading-tight">
          {DEVELOPER.name}
        </p>
      </div>
    </div>
  );
}
