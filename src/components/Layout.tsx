import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDbRefresh } from '../context/DataContext';
import { getNotificationCount } from '../lib/db';
import AiChatbot from './AiChatbot';
import { AppFooter } from './AppFooter';
import { ProfileAvatar } from './ProfileAvatar';
import { HamburgerButton, Sidebar, getNavItems } from './Sidebar';
import { getUserById } from '../lib/db';
import type { UserRole } from '../types';

const SIDEBAR_STORAGE_KEY = 'csu_ojt_sidebar_open';

const roleDashboard: Record<UserRole, string> = {
  admin: '/admin',
  coordinator: '/coordinator',
  student: '/student',
  supervisor: '/supervisor',
};

const roleLabels: Record<UserRole, string> = {
  admin: 'Administrator',
  coordinator: 'Coordinator',
  student: 'Student',
  supervisor: 'Supervisor',
};

function readSidebarOpen(): boolean {
  try {
    const v = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return v === null ? true : v === 'true';
  } catch {
    return true;
  }
}

function persistSidebarOpen(open: boolean) {
  try {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
  } catch {
    /* ignore */
  }
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const version = useDbRefresh();
  const [sidebarOpen, setSidebarOpen] = useState(readSidebarOpen);

  const profileUser = useMemo(
    () => (user ? getUserById(user.id) : null),
    [user, version]
  );

  const notifCount = useMemo(() => {
    if (user?.role === 'student' && user) return getNotificationCount(user.id);
    return 0;
  }, [user, version]);

  const navItems = useMemo(
    () => (user ? getNavItems(user.role, notifCount) : []),
    [user, notifCount]
  );

  const showSidebar = Boolean(user);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => {
      const next = !prev;
      persistSidebarOpen(next);
      return next;
    });
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
    persistSidebarOpen(false);
  }, []);

  useEffect(() => {
    if (!showSidebar) return;
    const mobile = window.matchMedia('(max-width: 1023px)');
    if (mobile.matches) closeSidebar();
  }, [location.pathname, showSidebar, closeSidebar]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!showSidebar) {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 bg-[#0b0a1a]/90 backdrop-blur-md border-b border-violet-500/30 text-[#f5f3ff] shadow-[0_0_24px_rgba(168,85,247,0.15)]">
          <div className="mx-auto flex min-h-[56px] sm:min-h-[64px] max-w-6xl items-center justify-between gap-2 px-3 sm:px-4">
            <Link to="/" className="flex min-w-0 shrink items-center gap-2 sm:gap-2.5 group">
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#e879f9] text-lg shadow-[0_0_16px_rgba(168,85,247,0.35)] group-hover:scale-105 transition">
                ✨
              </span>
              <span className="font-display font-bold text-base sm:text-lg text-[#f5f3ff] group-hover:text-fuchsia-200 transition truncate">
                <span className="xs:hidden">OJT</span>
                <span className="hidden xs:inline">CSU OJT</span>
              </span>
            </Link>
            <nav className="flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 shrink-0">
              <span className="hidden lg:inline text-xs text-violet-500/80 rounded-full border border-violet-500/25 px-2.5 py-1.5 whitespace-nowrap">
                ✨ AI assistant
              </span>
              <Link to="/login" className="header-nav-btn-outline whitespace-nowrap">
                Sign in
              </Link>
              <Link to="/register" className="header-nav-btn-primary whitespace-nowrap">
                Register
              </Link>
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 min-w-0 px-3 sm:px-4 py-5 sm:py-10">
          <Outlet />
        </main>
        <AppFooter />
        <AiChatbot />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close menu overlay"
          onClick={closeSidebar}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        items={navItems}
        roleLabel={roleLabels[user!.role]}
        onNavigate={closeSidebar}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex min-h-[52px] sm:min-h-[56px] shrink-0 flex-wrap items-center gap-x-2 gap-y-1 border-b border-violet-500/30 bg-[#0b0a1a]/95 backdrop-blur-md px-3 sm:px-4 py-1.5 sm:py-0 text-[#f5f3ff] shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <HamburgerButton open={sidebarOpen} onClick={toggleSidebar} />
          <Link
            to={roleDashboard[user!.role]}
            className="min-w-0 flex-1 truncate flex items-center gap-1.5 sm:gap-2 hover:text-fuchsia-300 transition"
          >
            <span className="text-lg shrink-0">🍬</span>
            <span className="font-display font-bold text-sm sm:text-base tracking-wide truncate hidden xs:inline">
              CSU OJT
            </span>
          </Link>
          <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2 shrink-0">
            <span className="hidden md:inline max-w-[120px] lg:max-w-[160px] truncate text-xs sm:text-sm text-violet-400">
              {user!.full_name}
            </span>
            <Link
              to="/profile"
              className="btn-touch flex items-center gap-1.5 sm:gap-2 rounded-xl border border-violet-500/30 bg-[#1a1535]/80 px-2 sm:px-2.5 text-xs sm:text-sm text-violet-200 hover:border-fuchsia-400/50 hover:text-fuchsia-200 transition"
              title="My profile"
            >
              <ProfileAvatar
                name={user!.full_name}
                avatarUrl={profileUser?.avatar_url ?? user!.avatar_url}
                role={user!.role}
                size="sm"
              />
              <span className="hidden sm:inline">Profile</span>
            </Link>
            <Link
              to="/change-password"
              className="btn-touch hidden md:inline-flex items-center rounded-xl border border-violet-500/25 px-2.5 text-xs sm:text-sm text-violet-300 hover:text-fuchsia-300 transition whitespace-nowrap"
              title="Change password"
            >
              Password
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="btn-touch rounded-xl border border-violet-500/40 bg-[#1a1535] px-3 text-xs sm:text-sm text-violet-200 hover:bg-[#7c3aed] transition whitespace-nowrap"
              title="Log out"
            >
              <span className="sm:hidden" aria-label="Log out">
                ↪
              </span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        <main className="flex-1 min-w-0 overflow-auto p-3 sm:p-4 md:p-6">
          <Outlet />
        </main>

        <AppFooter compact />
      </div>

      <AiChatbot />
    </div>
  );
}
