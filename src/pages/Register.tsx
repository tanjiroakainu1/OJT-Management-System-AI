import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthField } from '../components/auth/AuthField';
import { AuthShell, PasswordStrength } from '../components/auth/AuthShell';
import { DeveloperCredit } from '../components/AppFooter';
import { Alert } from '../components/ui';
import { registerStudent } from '../lib/db';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must have at least 6 characters.');
      return;
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const result = await registerStudent({
      password: form.password,
      email: form.email,
      full_name: form.full_name,
    });
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Registration failed.');
      return;
    }
    navigate('/login?registered=1');
  };

  return (
    <AuthShell
      variant="register"
      title="Create your account"
      subtitle="Register as a student to start your OJT journey"
      footer={
        <div className="mt-4 flex justify-center">
          <DeveloperCredit variant="inline" />
        </div>
      }
    >
      {error && <Alert type="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <AuthField
          label="Full name"
          icon="👤"
          type="text"
          autoComplete="name"
          placeholder="Juan Dela Cruz"
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          required
        />
        <AuthField
          label="Email address"
          icon="✉️"
          type="email"
          autoComplete="email"
          placeholder="student@gmail.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <AuthField
          label="Password"
          icon="🔒"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 6 characters"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          showToggle
          required
        />
        <AuthField
          label="Confirm password"
          icon="🔐"
          type="password"
          autoComplete="new-password"
          placeholder="Repeat password"
          value={form.confirm_password}
          onChange={(e) => setForm({ ...form, confirm_password: e.target.value })}
          showToggle
          required
        />

        {(form.password || form.confirm_password) && (
          <PasswordStrength password={form.password} confirm={form.confirm_password} />
        )}

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account →'}
        </button>
      </form>

      <div className="mt-6 rounded-xl border border-violet-500/20 bg-[#12102a]/60 p-4">
        <p className="text-xs font-semibold text-violet-200 mb-2">After you register</p>
        <ol className="text-xs text-violet-400/90 space-y-1.5 list-decimal list-inside">
          <li>Sign in with your new email & password</li>
          <li>Complete your profile & photo</li>
          <li>Apply for OJT at a partner company</li>
        </ol>
      </div>
    </AuthShell>
  );
}
