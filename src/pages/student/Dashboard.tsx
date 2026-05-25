import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotificationCount } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, PageHeader } from '../../components/ui';

const tileStyles = [
  'from-[#7c3aed] via-[#6d28d9] to-[#0b0a1a] border-violet-500/40',
  'from-[#db2777] via-[#be185d] to-[#0b0a1a] border-pink-500/40',
  'from-[#0891b2] via-[#0e7490] to-[#0b0a1a] border-cyan-500/40',
  'from-[#a855f7] via-[#7c3aed] to-[#0b0a1a] border-fuchsia-500/40',
  'from-[#312e81] via-[#1e1b4b] to-[#0b0a1a] border-indigo-500/40',
  'from-[#1e1b4b] via-[#12102a] to-[#0b0a1a] border-violet-800/40',
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const version = useDbRefresh();
  const notif = useMemo(
    () => (user ? getNotificationCount(user.id) : 0),
    [user, version]
  );

  const tiles = [
    { to: '/student/logs', label: 'Daily Logs', icon: '📋' },
    { to: '/student/requirements', label: 'Requirements', icon: '📄' },
    { to: '/student/timeline', label: 'Timeline', icon: '🕐', badge: notif },
    { to: '/student/apply', label: 'Apply for OJT', icon: '💼' },
    { to: '/profile', label: 'Edit Profile', icon: '✏️' },
    { to: '/change-password', label: 'Change Password', icon: '🔑' },
  ];

  return (
    <>
      <PageHeader title="Student Dashboard" subtitle={`Welcome, ${user?.full_name} 🍬`} />
      <Card>
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {tiles.map((t, i) => (
            <Link
              key={t.to}
              to={t.to}
              className={`bg-gradient-to-br ${tileStyles[i]} text-[#f5f3ff] rounded-2xl p-6 text-center border shadow-[0_0_24px_rgba(168,85,247,0.25)] hover:shadow-[0_0_32px_rgba(232,121,249,0.35)] hover:scale-[1.03] transition-all relative`}
            >
              <div className="text-3xl mb-2">{t.icon}</div>
              <div className="font-medium font-display">{t.label}</div>
              {t.badge !== undefined && t.badge > 0 && (
                <span className="absolute top-2 right-2 bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full font-bold animate-pulse">
                  {t.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </Card>
    </>
  );
}
