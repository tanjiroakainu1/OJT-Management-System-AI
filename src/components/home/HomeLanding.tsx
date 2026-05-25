import { Link, useNavigate } from 'react-router-dom';
import { DeveloperCredit } from '../AppFooter';
import { DemoRoleButtons } from '../DemoRoleButtons';
import { APP_SHORT_NAME, UNIVERSITY } from '../../lib/meta';

const ROLE_CARDS = [
  {
    icon: '🎓',
    title: 'Students',
    tagline: 'Your OJT journey starts here',
    desc: 'Apply to companies, log daily hours, upload requirements, and track evaluations in one place.',
    cta: 'Create account',
    to: '/register',
    accent: 'from-violet-600 via-purple-600 to-fuchsia-600',
    border: 'group-hover:border-fuchsia-400/60',
    glow: 'group-hover:shadow-[0_0_40px_rgba(232,121,249,0.25)]',
  },
  {
    icon: '📋',
    title: 'Coordinators',
    tagline: 'Guide the program',
    desc: 'Review applications, set requirements, post announcements, and monitor student progress.',
    cta: 'Sign in',
    to: '/login',
    accent: 'from-purple-600 via-violet-600 to-indigo-600',
    border: 'group-hover:border-violet-400/60',
    glow: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.25)]',
  },
  {
    icon: '🏢',
    title: 'Supervisors',
    tagline: 'Mentor on-site',
    desc: 'Approve daily logs, evaluate interns, and view attendance reports with charts.',
    cta: 'Sign in',
    to: '/login',
    accent: 'from-cyan-600 via-violet-600 to-purple-600',
    border: 'group-hover:border-cyan-400/60',
    glow: 'group-hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]',
  },
];

const FEATURES = [
  { icon: '📝', label: 'Daily logs', desc: 'Time in / time out tracking' },
  { icon: '📎', label: 'Requirements', desc: 'PDF & photo uploads' },
  { icon: '⭐', label: 'Evaluations', desc: 'Structured 1–5 ratings' },
  { icon: '📊', label: 'Reports', desc: 'Charts & analytics' },
  { icon: '✨', label: 'AI assistant', desc: 'Ask anything, anytime' },
  { icon: '🔐', label: 'Secure roles', desc: 'Admin to student access' },
];

const STEPS = [
  { n: '01', title: 'Register or sign in', text: 'Students create an account; staff use assigned credentials.' },
  { n: '02', title: 'Complete your profile', text: 'Add details and a profile photo.' },
  { n: '03', title: 'Apply & get approved', text: 'Submit OJT applications to partner companies.' },
  { n: '04', title: 'Log, submit, succeed', text: 'Daily logs, requirements, and evaluations — all tracked.' },
];

export function HomeLanding() {
  const navigate = useNavigate();

  const prefillLogin = (email: string, password: string) => {
    sessionStorage.setItem(
      'csu_ojt_login_prefill',
      JSON.stringify({ email, password })
    );
    navigate('/login');
  };

  return (
    <div className="home-landing -mx-3 sm:-mx-4 md:-mx-6 px-3 sm:px-4 md:px-6 pb-4 min-w-0">
      {/* Hero */}
      <section className="home-hero relative overflow-hidden rounded-3xl border border-violet-500/30 mb-12">
        <div className="home-hero-bg absolute inset-0 pointer-events-none" />
        <div className="home-orb home-orb-a" />
        <div className="home-orb home-orb-b" />
        <div className="home-orb home-orb-c" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-6 sm:gap-10 p-5 sm:p-8 md:p-12 lg:p-14 items-center">
          <div className="text-center lg:text-left min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-[#12102a]/80 px-3 py-1 text-xs font-medium text-violet-200 mb-5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {UNIVERSITY}
            </div>
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-[3.25rem] font-bold font-display text-[#f5f3ff] leading-[1.1] tracking-tight">
              On-the-Job Training,{' '}
              <span className="candy-title block sm:inline">reimagined.</span>
            </h1>
            <p className="mt-4 text-base sm:text-lg text-violet-300/90 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {APP_SHORT_NAME} connects students, coordinators, supervisors, and admins —
              applications, logs, requirements, and evaluations in one beautiful workspace.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col xs:flex-row flex-wrap items-stretch xs:items-center justify-center lg:justify-start gap-2.5 sm:gap-3 max-w-md mx-auto lg:mx-0 lg:max-w-none">
              <Link to="/register" className="home-cta-primary text-center">
                Start as student →
              </Link>
              <Link to="/login" className="home-cta-secondary text-center">
                Sign in
              </Link>
            </div>
            <p className="mt-4 text-xs text-violet-500/80">
              Questions? Tap <span className="text-fuchsia-300 font-medium">✨</span> in the corner
            </p>
          </div>

          {/* Decorative stats panel */}
          <div className="relative hidden xs:block">
            <div className="home-stats-panel rounded-2xl border border-violet-500/30 bg-[#0b0a1a]/60 backdrop-blur-md p-6 shadow-[0_0_48px_rgba(168,85,247,0.2)]">
              <p className="text-xs uppercase tracking-widest text-fuchsia-300/90 font-semibold mb-4">
                Platform highlights
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: '4', l: 'User roles' },
                  { v: '∞', l: 'Daily logs' },
                  { v: 'AI', l: 'Assistant' },
                  { v: '100%', l: 'Digital' },
                ].map((s) => (
                  <div
                    key={s.l}
                    className="rounded-xl border border-violet-500/25 bg-[#1a1535]/80 p-4 text-center"
                  >
                    <p className="text-2xl font-bold font-display text-[#f5f3ff]">{s.v}</p>
                    <p className="text-[11px] text-violet-400/80 mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Apply OJT', 'Approve logs', 'Upload files', 'View charts'].map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-violet-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role cards */}
      <section className="mb-14">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-300/90 font-semibold mb-2">
            Who it&apos;s for
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#f5f3ff]">
            Built for every role
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {ROLE_CARDS.map((r) => (
            <Link
              key={r.title}
              to={r.to}
              className={`home-role-card group relative overflow-hidden rounded-2xl border border-violet-500/30 bg-[#1a1535]/90 p-6 transition-all duration-300 ${r.border} ${r.glow}`}
            >
              <div
                className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${r.accent}`}
              />
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${r.accent} text-2xl shadow-lg mb-4`}
              >
                {r.icon}
              </div>
              <p className="text-[11px] uppercase tracking-wider text-fuchsia-300/80 font-medium">
                {r.tagline}
              </p>
              <h3 className="text-xl font-bold font-display text-[#f5f3ff] mt-1 mb-2">
                {r.title}
              </h3>
              <p className="text-sm text-violet-300/80 leading-relaxed mb-4">{r.desc}</p>
              <span className="text-sm font-semibold text-fuchsia-300 group-hover:text-fuchsia-200">
                {r.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature bento */}
      <section className="mb-14">
        <div className="rounded-3xl border border-violet-500/25 bg-[#12102a]/50 p-6 sm:p-8">
          <h2 className="text-xl font-bold font-display text-[#f5f3ff] mb-6 text-center">
            Everything you need for OJT
          </h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {FEATURES.map((f) => (
              <div
                key={f.label}
                className="rounded-xl border border-violet-500/20 bg-[#1a1535]/60 p-4 text-center hover:border-violet-400/40 hover:bg-[#1a1535] transition-all"
              >
                <span className="text-2xl">{f.icon}</span>
                <p className="text-sm font-semibold text-[#f5f3ff] mt-2">{f.label}</p>
                <p className="text-[10px] text-violet-400/70 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + demo */}
      <section className="grid lg:grid-cols-2 gap-6 mb-14">
        <div className="rounded-3xl border border-violet-500/30 bg-gradient-to-br from-[#1a1535] to-[#12102a] p-6 sm:p-8">
          <p className="text-xs uppercase tracking-widest text-violet-400 mb-2">How it works</p>
          <h2 className="text-xl font-bold font-display text-[#f5f3ff] mb-6">
            Four steps to success
          </h2>
          <ol className="space-y-4">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#e879f9] text-xs font-bold text-white">
                  {s.n}
                </span>
                <div>
                  <p className="font-semibold text-[#f5f3ff]">{s.title}</p>
                  <p className="text-sm text-violet-400/80 mt-0.5">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-3xl border border-violet-500/30 bg-[#1a1535] p-6 sm:p-8 flex flex-col">
          <p className="text-xs uppercase tracking-widest text-fuchsia-300/90 mb-2">
            Try it now
          </p>
          <h2 className="text-xl font-bold font-display text-[#f5f3ff] mb-2">
            Demo quick access
          </h2>
          <p className="text-sm text-violet-400/80 mb-5">
            Jump in with a demo account — one tap takes you to sign in.
          </p>
          <DemoRoleButtons onSelect={prefillLogin} />
          <Link
            to="/login"
            className="mt-5 block text-center text-sm font-medium text-violet-300 hover:text-fuchsia-300 transition"
          >
            Or open full sign in page →
          </Link>
        </div>
      </section>

      {/* Developer */}
      <div className="max-w-md mx-auto">
        <DeveloperCredit variant="hero" />
      </div>
    </div>
  );
}
