import { Link, useNavigate } from 'react-router-dom';
import { DeveloperCredit } from '../components/AppFooter';
import { DemoRoleButtons } from '../components/DemoRoleButtons';
import { useAuth } from '../context/AuthContext';
import { UNIVERSITY } from '../lib/meta';
import { Button, Card } from '../components/ui';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    const dash: Record<string, string> = {
      admin: '/admin',
      coordinator: '/coordinator',
      student: '/student',
      supervisor: '/supervisor',
    };
    return (
      <div className="text-center py-16">
        <p className="text-6xl mb-4 animate-float">🍬</p>
        <p className="text-violet-300 mb-6">
          Welcome back, <span className="text-[#f5f3ff] font-medium">{user.full_name}</span>
        </p>
        <Link to={dash[user.role]}>
          <Button>Enter Dashboard ✨</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-[#1a1535] p-10 text-center mb-10 shadow-[0_0_32px_rgba(168,85,247,0.25)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.25),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(244,114,182,0.15),transparent_50%)] pointer-events-none" />
        <p className="text-5xl mb-2 animate-float relative">🌌</p>
        <h1 className="text-4xl font-bold font-display text-[#f5f3ff] mb-1 relative">
          {UNIVERSITY}
        </h1>
        <h2 className="candy-title text-3xl mb-4 relative">OJT Management System</h2>
        <p className="text-violet-300/90 mb-8 max-w-2xl mx-auto relative">
          Streamlining the On-the-Job Training journey for students, coordinators, and supervisors
        </p>
        <div className="relative flex flex-col items-center gap-3">
          <Link to="/login" className="inline-block">
            <span className="inline-block rounded-xl bg-gradient-to-r from-[#7c3aed] via-[#a855f7] to-[#e879f9] px-10 py-3 font-semibold text-white border border-violet-400/40 shadow-[0_0_24px_rgba(168,85,247,0.35)] hover:scale-105 transition-all">
              Get Started
            </span>
          </Link>
          <p className="text-xs text-violet-400/80">
            Questions? Tap the <span className="text-fuchsia-300 font-medium">✨</span> assistant
            in the corner
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        <Card>
          <div className="text-center">
            <div className="text-5xl mb-3">🎓</div>
            <h3 className="font-bold text-lg mb-2 text-[#f5f3ff] font-display">Students</h3>
            <p className="text-muted text-sm mb-4">
              Apply for OJT, submit daily logs, track requirements, and view evaluations.
            </p>
            <Link to="/register" className="link-action font-medium">
              Get Started →
            </Link>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-5xl mb-3">👔</div>
            <h3 className="font-bold text-lg mb-2 text-[#f5f3ff] font-display">Coordinators</h3>
            <p className="text-muted text-sm mb-4">
              Manage applications, monitor progress, set requirements, and generate reports.
            </p>
            <Link to="/login" className="link-action font-medium">
              Login →
            </Link>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <div className="text-5xl mb-3">🛡️</div>
            <h3 className="font-bold text-lg mb-2 text-[#f5f3ff] font-display">Supervisors</h3>
            <p className="text-muted text-sm mb-4">
              Monitor activities, approve daily logs, and provide performance evaluations.
            </p>
            <Link to="/login" className="link-action font-medium">
              Login →
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card title="About the System">
          <p className="text-muted text-sm mb-3">
            The CSU OJT Management System streamlines the entire On-the-Job Training process.
          </p>
          <ul className="list-disc list-inside text-sm text-muted space-y-1">
            <li>Simplified OJT application and approval</li>
            <li>Efficient daily activity logging</li>
            <li>Digital requirement submission</li>
            <li>Standardized evaluation system</li>
            <li>Comprehensive reporting</li>
          </ul>
        </Card>
        <Card title="Get Started">
          <ol className="list-decimal list-inside text-sm text-muted space-y-2">
            <li>Students register for an account</li>
            <li>Complete your profile</li>
            <li>Apply for OJT at partner companies</li>
            <li>Log daily activities once approved</li>
            <li>Submit required documents</li>
            <li>Track progress and evaluations</li>
          </ol>
          <div className="mt-4 pt-4 border-t border-violet-500/25">
            <p className="font-medium text-violet-300 text-sm mb-3 text-center">
              Demo quick access
            </p>
            <DemoRoleButtons
              onSelect={(e, p) => {
                sessionStorage.setItem(
                  'csu_ojt_login_prefill',
                  JSON.stringify({ email: e, password: p })
                );
                navigate('/login');
              }}
            />
          </div>
        </Card>
      </div>

      <div className="mt-10 max-w-lg mx-auto">
        <DeveloperCredit variant="hero" />
      </div>
    </>
  );
}
