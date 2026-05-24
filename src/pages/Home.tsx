import { Link } from 'react-router-dom';
import { HomeLanding } from '../components/home/HomeLanding';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import type { UserRole } from '../types';

export default function Home() {
  const { user } = useAuth();

  if (user) {
    const dash: Record<UserRole, string> = {
      admin: '/admin',
      coordinator: '/coordinator',
      student: '/student',
      supervisor: '/supervisor',
    };
    return (
      <div className="relative overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-br from-[#1a1535] via-[#221b4a] to-[#12102a] py-20 px-6 text-center shadow-[0_0_40px_rgba(168,85,247,0.2)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(232,121,249,0.15),transparent_55%)] pointer-events-none" />
        <div className="relative">
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#e879f9] text-4xl mb-6 shadow-[0_0_32px_rgba(168,85,247,0.4)] animate-float">
            ✨
          </div>
          <p className="text-violet-300 mb-2 text-sm uppercase tracking-widest">Welcome back</p>
          <h1 className="text-3xl font-bold font-display text-[#f5f3ff] mb-6">
            {user.full_name}
          </h1>
          <Link to={dash[user.role]}>
            <Button className="px-10 py-3 text-base">Enter dashboard →</Button>
          </Link>
        </div>
      </div>
    );
  }

  return <HomeLanding />;
}
