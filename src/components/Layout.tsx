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
        <header className="bg-[#0b0a1a] border-b border-violet-500/30 text-[#f5f3ff] shadow-[0_0_24px_rgba(168,85,247,0.2)]">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl animate-float">🌌</span>
              <span className="font-candy text-xl candy-title">CSU OJT</span>
            </Link>
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="hidden sm:inline text-xs text-violet-500/80">
                ✨ AI help
              </span>
              <Link to="/login" className="text-sm text-violet-300 hover:text-fuchsia-300 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#e879f9] px-4 py-2 text-sm font-medium text-white border border-violet-400/40 shadow-[0_0_24px_rgba(168,85,247,0.35)]"
              >
                Register
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
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
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-violet-500/30 bg-[#0b0a1a]/95 backdrop-blur-md px-4 text-[#f5f3ff] shadow-[0_0_20px_rgba(168,85,247,0.15)]">
          <HamburgerButton open={sidebarOpen} onClick={toggleSidebar} />
          <Link
            to={roleDashboard[user!.role]}
            className="truncate flex items-center gap-2 hover:text-fuchsia-300 transition"
          >
            <span className="text-lg">🍬</span>
            <span className="font-display font-bold tracking-wide hidden sm:inline">
              CSU OJT System
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3 sm:gap-4">
            <span className="hidden max-w-[140px] truncate text-sm text-violet-400 lg:inline">
              {user!.full_name}
            </span>
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl border border-violet-500/30 bg-[#1a1535]/80 px-2 py-1 text-sm text-violet-200 hover:border-fuchsia-400/50 hover:text-fuchsia-200 transition"
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
              className="hidden text-sm text-violet-300 hover:text-fuchsia-300 transition sm:inline"
            >
              Password
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-xl border border-violet-500/40 bg-[#1a1535] px-3 py-1 text-sm text-violet-200 hover:bg-[#7c3aed] transition"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <Outlet />
        </main>

        <AppFooter compact />
      </div>

      <AiChatbot />
    </div>
  );
}
