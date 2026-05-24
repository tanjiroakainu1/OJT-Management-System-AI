import { NavLink } from 'react-router-dom';
import { DEVELOPER } from '../lib/meta';
import type { UserRole } from '../types';

export interface NavItem {
  to: string;
  label: string;
  badge?: number;
  end?: boolean;
}

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/students', label: 'Students' },
  { to: '/admin/companies', label: 'Companies' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/reports', label: 'Reports' },
];

const coordinatorNav: NavItem[] = [
  { to: '/coordinator', label: 'Dashboard', end: true },
  { to: '/coordinator/students', label: 'Students' },
  { to: '/coordinator/applications', label: 'Applications' },
  { to: '/coordinator/requirements', label: 'Requirements' },
  { to: '/coordinator/announcements', label: 'Announcements' },
  { to: '/coordinator/evaluations', label: 'Evaluations' },
  { to: '/coordinator/reports', label: 'Reports' },
];

const studentNav: NavItem[] = [
  { to: '/student', label: 'Dashboard', end: true },
  { to: '/student/logs', label: 'Daily Logs' },
  { to: '/student/requirements', label: 'Requirements' },
  { to: '/student/timeline', label: 'Timeline' },
  { to: '/student/apply', label: 'Apply OJT' },
];

const supervisorNav: NavItem[] = [
  { to: '/supervisor', label: 'Dashboard', end: true },
  { to: '/supervisor/students', label: 'Students' },
  { to: '/supervisor/logs/pending', label: 'Pending Logs' },
  { to: '/supervisor/evaluations', label: 'Evaluations' },
  { to: '/supervisor/evaluate', label: 'Evaluate Student' },
  { to: '/supervisor/attendance', label: 'Attendance' },
];

export function getNavItems(role: UserRole, timelineBadge?: number): NavItem[] {
  switch (role) {
    case 'admin':
      return adminNav;
    case 'coordinator':
      return coordinatorNav;
    case 'student':
      return studentNav.map((item) =>
        item.to === '/student/timeline' ? { ...item, badge: timelineBadge } : item
      );
    case 'supervisor':
      return supervisorNav;
  }
}

interface SidebarProps {
  open: boolean;
  items: NavItem[];
  roleLabel: string;
  onNavigate?: () => void;
}

export function Sidebar({ open, items, roleLabel, onNavigate }: SidebarProps) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0b0a1a] border-r border-violet-500/30 text-[#f5f3ff] transition-all duration-300 ease-in-out lg:static lg:shadow-none ${
        open
          ? 'translate-x-0 lg:w-64 lg:shrink-0'
          : '-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden lg:shrink-0'
      }`}
      aria-hidden={!open}
    >
      <div className="flex h-14 w-64 shrink-0 items-center gap-2 border-b border-violet-500/30 px-4 bg-[#221b4a]">
        <span className="text-xl">🌌</span>
        <span className="font-candy text-lg candy-title">CSU OJT</span>
      </div>
      <p className="w-64 shrink-0 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-fuchsia-400">
        {roleLabel}
      </p>
      <nav className="w-64 flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#e879f9] text-white border border-violet-400/40 shadow-[0_0_16px_rgba(168,85,247,0.3)]'
                  : 'text-violet-300 hover:bg-[#1a1535] hover:text-[#f5f3ff] border border-transparent'
              }`
            }
          >
            <span>{item.label}</span>
            {item.badge !== undefined && item.badge > 0 && (
              <span className="rounded-full bg-gradient-to-r from-fuchsia-500 to-pink-500 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="w-64 shrink-0 border-t border-violet-500/30 p-3">
        <div className="rounded-xl border border-violet-500/25 bg-[#12102a]/80 p-2.5">
          <p className="text-[10px] uppercase tracking-wider text-violet-400/80">Developed by</p>
          <p className="text-xs font-semibold bg-gradient-to-r from-violet-200 to-fuchsia-200 bg-clip-text text-transparent truncate">
            {DEVELOPER.name}
          </p>
          <p className="text-[10px] text-violet-500/70 mt-1 truncate">
            <span className="text-fuchsia-400">🍬</span> Caraga State University
          </p>
        </div>
      </div>
    </aside>
  );
}

export function HamburgerButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-fuchsia-300 hover:bg-[#1a1535] border border-transparent hover:border-violet-500/40 focus:outline-none focus:ring-2 focus:ring-purple-500/40 transition"
      aria-label={open ? 'Close menu' : 'Open menu'}
      aria-expanded={open}
    >
      {open ? (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}
