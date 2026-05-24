import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthField } from '../components/auth/AuthField';
import { AuthShell } from '../components/auth/AuthShell';
import { DeveloperCredit } from '../components/AppFooter';
import { DemoRoleButtons } from '../components/DemoRoleButtons';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/ui';
import type { UserRole } from '../types';

const roleRoutes: Record<UserRole, string> = {
  admin: '/admin',
  coordinator: '/coordinator',
  student: '/student',
  supervisor: '/supervisor',
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered') === '1') {
      setSuccess('Account created! Sign in with your new credentials.');
    }
  }, [searchParams]);

  useEffect(() => {
    const raw = sessionStorage.getItem('csu_ojt_login_prefill');
    if (!raw) return;
    try {
      const { email: e, password: p } = JSON.parse(raw) as {
        email?: string;
        password?: string;
      };
      if (e) setEmail(e);
      if (p) setPassword(p);
    } catch {
      /* ignore */
    }
    sessionStorage.removeItem('csu_ojt_login_prefill');
  }, []);

  const completeLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setSuccess('');
    setLoading(true);
    const err = await login(loginEmail, loginPassword);
    setLoading(false);
    if (err) {
      setError(err);
      return;
    }
    const raw = sessionStorage.getItem('csu_ojt_auth');
    if (raw) {
      const user = JSON.parse(raw) as { role: UserRole };
      navigate(roleRoutes[user.role]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void completeLogin(email, password);
  };

  return (
    <>
      <AuthShell
        variant="login"
        title="Sign in"
        subtitle="Enter your credentials or pick a demo role below"
        footer={
          <div className="mt-4 flex justify-center">
            <DeveloperCredit variant="inline" />
          </div>
        }
      >
        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <AuthField
            label="Email address"
            icon="✉️"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <AuthField
            label="Password"
            icon="🔒"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            showToggle
            required
          />
          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <div className="mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-violet-500/30" />
            <span className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold">
              Quick access
            </span>
            <div className="flex-1 h-px bg-violet-500/30" />
          </div>
          <DemoRoleButtons
            activeEmail={email}
            loading={loading}
            quickLogin
            onSelect={(e, p) => {
              setEmail(e);
              setPassword(p);
            }}
            onQuickLogin={completeLogin}
          />
          <p className="text-[10px] text-violet-500/70 mt-3 text-center">
            One tap — sign in as any demo role
          </p>
        </div>
      </AuthShell>
    </>
  );
}
