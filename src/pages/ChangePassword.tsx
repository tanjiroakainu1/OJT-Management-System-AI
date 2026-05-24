import { FormEvent, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserById, updateUser, verifyPassword } from '../lib/db';
import { Alert, Button, Card, Input, PageHeader } from '../components/ui';

export default function ChangePassword() {
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    if (!user) return;
    const dbUser = getUserById(user.id)!;
    const valid = await verifyPassword(current, dbUser.password);
    if (!valid) {
      setErr('Current password is incorrect.');
      return;
    }
    if (newPass.length < 6) {
      setErr('New password must be at least 6 characters.');
      return;
    }
    if (newPass !== confirm) {
      setErr('Passwords do not match.');
      return;
    }
    await updateUser(user.id, { password: newPass });
    setMsg('Password changed successfully.');
    setCurrent('');
    setNewPass('');
    setConfirm('');
  };

  return (
    <>
      <PageHeader title="Change Password" />
      {msg && <Alert type="success">{msg}</Alert>}
      {err && <Alert type="error">{err}</Alert>}
      <Card>
        <form onSubmit={handleSubmit} className="max-w-md">
          <Input
            label="Current Password"
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            required
          />
          <Input
            label="New Password"
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            required
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
          <Button type="submit">Update Password</Button>
        </form>
      </Card>
    </>
  );
}
