import { type ChangeEvent, FormEvent, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProfileAvatar } from '../components/ProfileAvatar';
import { useAuth } from '../context/AuthContext';
import {
  PROFILE_PHOTO_ACCEPT,
  readProfilePhoto,
  validateProfilePhoto,
} from '../lib/fileUpload';
import {
  getCoordinatorByUserId,
  getStudentByUserId,
  getSupervisorByUserId,
  getUserById,
  updateUser,
} from '../lib/db';
import type { UserRole } from '../types';
import { Alert, Button, Card, Input, PageHeader, RoleBadge } from '../components/ui';

const ROLE_META: Record<
  UserRole,
  { icon: string; label: string; tagline: string }
> = {
  admin: { icon: '👑', label: 'Administrator', tagline: 'Managing the OJT platform' },
  coordinator: { icon: '📋', label: 'Coordinator', tagline: 'Guiding OJT programs' },
  supervisor: { icon: '🏢', label: 'Supervisor', tagline: 'Mentoring interns' },
  student: { icon: '🎓', label: 'Student', tagline: 'Building your OJT journey' },
};

export default function Profile() {
  const { user, refresh } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const dbUser = getUserById(user.id)!;
  const student = getStudentByUserId(user.id);
  const coordinator = getCoordinatorByUserId(user.id);
  const supervisor = getSupervisorByUserId(user.id);
  const meta = ROLE_META[user.role];

  const [avatarUrl, setAvatarUrl] = useState<string | null>(dbUser.avatar_url ?? null);
  const [photoFileName, setPhotoFileName] = useState<string | null>(null);
  const [form, setForm] = useState({
    full_name: dbUser.full_name,
    email: dbUser.email,
    contact: student?.contact ?? coordinator?.contact ?? supervisor?.contact ?? '',
    department: coordinator?.department ?? '',
    position: supervisor?.position ?? '',
    course: student?.course ?? '',
    year: student?.year ?? 1,
    section: student?.section ?? '',
    address: student?.address ?? '',
    student_id: student?.student_id ?? '',
  });
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [photoErr, setPhotoErr] = useState('');

  const handlePhotoChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoErr('');
    if (!file) return;
    const validation = validateProfilePhoto(file);
    if (validation) {
      setPhotoErr(validation);
      return;
    }
    try {
      const dataUrl = await readProfilePhoto(file);
      setAvatarUrl(dataUrl);
      setPhotoFileName(file.name);
    } catch (ex) {
      setPhotoErr(ex instanceof Error ? ex.message : 'Could not load photo.');
    }
  };

  const handleRemovePhoto = () => {
    setAvatarUrl(null);
    setPhotoFileName(null);
    setPhotoErr('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    setErr('');
    const roleData: Record<string, unknown> = {};
    if (user.role === 'student' && student) {
      Object.assign(roleData, {
        course: form.course,
        year: form.year,
        section: form.section,
        contact: form.contact,
        address: form.address,
        student_id: form.student_id,
      });
    } else if (user.role === 'coordinator' && coordinator) {
      Object.assign(roleData, { department: form.department, contact: form.contact });
    } else if (user.role === 'supervisor' && supervisor) {
      Object.assign(roleData, { position: form.position, contact: form.contact });
    }
    const result = await updateUser(
      user.id,
      {
        full_name: form.full_name,
        email: form.email,
        avatar_url: avatarUrl,
      },
      Object.keys(roleData).length ? roleData : undefined
    );
    if (!result.ok) {
      setErr(result.error ?? 'Failed to update profile.');
      return;
    }
    refresh();
    setMsg('Profile saved successfully.');
  };

  const memberSince = new Date(dbUser.created_at).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Manage your profile photo and account details"
      />

      {msg && <Alert type="success">{msg}</Alert>}
      {err && <Alert type="error">{err}</Alert>}

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#1a1535] via-[#221b4a] to-[#12102a] p-6 mb-6 shadow-[0_0_32px_rgba(168,85,247,0.2)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(232,121,249,0.18),transparent_42%),radial-gradient(circle_at_8%_88%,rgba(103,232,249,0.12),transparent_42%)] pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
          <ProfileAvatar
            name={form.full_name}
            avatarUrl={avatarUrl}
            role={user.role}
            size="lg"
            className="mx-auto sm:mx-0"
          />
          <div className="flex-1 text-center sm:text-left min-w-0">
            <p className="text-xs uppercase tracking-widest text-fuchsia-300/90 font-medium">
              {meta.icon} {meta.tagline}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#f5f3ff] truncate mt-1">
              {form.full_name}
            </h2>
            <p className="text-sm text-violet-300/90 truncate">{form.email}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              <RoleBadge role={user.role} />
              <span className="text-xs rounded-full border border-violet-500/30 bg-[#12102a]/80 px-2.5 py-1 text-violet-300">
                Member since {memberSince}
              </span>
            </div>
          </div>
          <Link
            to="/change-password"
            className="quick-action-btn text-center shrink-0 self-center sm:self-auto"
          >
            🔐 Change password
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Photo column */}
          <div className="lg:col-span-1">
            <Card title="Profile Photo 🍬" className="lg:sticky lg:top-20">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <ProfileAvatar
                    name={form.full_name}
                    avatarUrl={avatarUrl}
                    role={user.role}
                    size="xl"
                  />
                  <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#e879f9] text-sm border-2 border-[#0b0a1a] shadow-lg">
                    📷
                  </span>
                </div>

                <input
                  ref={fileInputRef}
                  id="profile-photo"
                  type="file"
                  accept={PROFILE_PHOTO_ACCEPT}
                  onChange={handlePhotoChange}
                  className="sr-only"
                />

                <label
                  htmlFor="profile-photo"
                  className="w-full cursor-pointer rounded-xl border border-dashed border-fuchsia-400/50 bg-[#12102a]/80 px-4 py-6 text-center transition hover:border-fuchsia-300 hover:bg-violet-500/10 hover:shadow-[0_0_24px_rgba(232,121,249,0.2)]"
                >
                  <p className="text-3xl mb-2">🌌</p>
                  <p className="text-sm font-semibold text-[#f5f3ff]">
                    Choose photo
                  </p>
                  <p className="text-xs text-violet-400/80 mt-1">
                    JPG, PNG, GIF, WebP · max 1 MB
                  </p>
                </label>

                <div className="w-full mt-3 space-y-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Browse files
                  </Button>
                  {avatarUrl && (
                    <Button
                      type="button"
                      variant="danger"
                      className="w-full"
                      onClick={handleRemovePhoto}
                    >
                      Remove photo
                    </Button>
                  )}
                </div>

                {photoFileName && (
                  <p className="mt-3 text-xs text-cyan-300/90 text-center truncate w-full">
                    Selected: {photoFileName}
                  </p>
                )}
                {photoErr && (
                  <p className="mt-2 text-xs text-pink-300 text-center">{photoErr}</p>
                )}

                {/* Alternative visible file input */}
                <div className="w-full mt-4 pt-4 border-t border-violet-500/20">
                  <label
                    htmlFor="profile-photo-alt"
                    className="block text-xs font-medium text-violet-300 mb-2"
                  >
                    Or use file picker
                  </label>
                  <input
                    id="profile-photo-alt"
                    type="file"
                    accept={PROFILE_PHOTO_ACCEPT}
                    onChange={handlePhotoChange}
                    className="candy-file"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Form column */}
          <div className="lg:col-span-2 space-y-6">
            <Card title="Account Details">
              <div className="grid sm:grid-cols-2 gap-x-4">
                <Input
                  label="Full Name"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="rounded-xl border border-violet-500/20 bg-[#12102a]/60 px-4 py-3 text-sm">
                <span className="text-violet-400">Username: </span>
                <span className="text-[#f5f3ff] font-medium">{dbUser.username}</span>
              </div>
            </Card>

            {user.role === 'student' && (
              <Card title="🎓 Student Information">
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Input
                    label="Student ID"
                    value={form.student_id}
                    onChange={(e) => setForm({ ...form, student_id: e.target.value })}
                  />
                  <Input
                    label="Course"
                    value={form.course}
                    onChange={(e) => setForm({ ...form, course: e.target.value })}
                  />
                  <Input
                    label="Year"
                    type="number"
                    min={1}
                    max={5}
                    value={form.year}
                    onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
                  />
                  <Input
                    label="Section"
                    value={form.section}
                    onChange={(e) => setForm({ ...form, section: e.target.value })}
                  />
                  <Input
                    label="Contact"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  />
                  <div className="sm:col-span-2">
                    <Input
                      label="Address"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                    />
                  </div>
                </div>
              </Card>
            )}

            {user.role === 'coordinator' && (
              <Card title="📋 Coordinator Details">
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Input
                    label="Department"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                  />
                  <Input
                    label="Contact"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  />
                </div>
              </Card>
            )}

            {user.role === 'supervisor' && (
              <Card title="🏢 Supervisor Details">
                <div className="grid sm:grid-cols-2 gap-x-4">
                  <Input
                    label="Position"
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                  />
                  <Input
                    label="Contact"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                  />
                </div>
              </Card>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="sm:flex-1">
                ✨ Save Profile
              </Button>
              <Link
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : user.role === 'coordinator'
                      ? '/coordinator'
                      : user.role === 'supervisor'
                        ? '/supervisor'
                        : '/student'
                }
                className="quick-action-btn text-center sm:flex-1"
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
