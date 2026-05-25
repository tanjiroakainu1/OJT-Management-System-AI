import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  createAnnouncement,
  getAnnouncementById,
  getUserById,
  updateAnnouncement,
} from '../../lib/db';
import { Alert, Button, Card, Input, PageHeader, Textarea } from '../../components/ui';

export default function AnnouncementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const existing = id ? getAnnouncementById(Number(id)) : undefined;
  const creator = existing ? getUserById(existing.created_by) : null;

  const [form, setForm] = useState({
    title: existing?.title ?? '',
    message: existing?.message ?? '',
    target_course: existing?.target_course ?? '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.title.trim() || !form.message.trim()) {
      setError('Title and message are required.');
      return;
    }
    if (!user) return;

    const payload = {
      title: form.title.trim(),
      message: form.message.trim(),
      target_course: form.target_course.trim() || null,
    };

    if (isEdit && existing) {
      const result = updateAnnouncement(existing.id, payload);
      if (!result.ok) {
        setError(result.error ?? 'Failed to update announcement.');
        return;
      }
    } else {
      createAnnouncement({ ...payload, created_by: user.id });
    }
    navigate('/coordinator/announcements');
  };

  if (isEdit && !existing) {
    return (
      <>
        <PageHeader title="Edit Announcement" />
        <Alert type="error">Announcement not found.</Alert>
        <Link to="/coordinator/announcements" className="link-back">← Back</Link>
      </>
    );
  }

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Announcement' : 'New Announcement'} />
      {error && <Alert type="error">{error}</Alert>}
      {isEdit && creator && (
        <Card className="mb-4">
          <p className="text-sm text-body">
            Originally posted by{' '}
            <span className="font-medium text-[#f5f3ff]">{creator.full_name}</span>{' '}
            <span className="text-muted">({creator.email})</span>
          </p>
        </Card>
      )}
      <Card>
        <form onSubmit={handleSubmit} className="max-w-lg">
          <Input
            label="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            label="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          <Input
            label="Target Course (optional)"
            placeholder="Leave empty for all students"
            value={form.target_course}
            onChange={(e) => setForm({ ...form, target_course: e.target.value })}
          />
          {!isEdit && user && (
            <p className="text-sm text-muted mb-4">
              Posting as <span className="font-medium">{user.full_name}</span> ({user.email})
            </p>
          )}
          <div className="btn-row">
            <Button type="submit">{isEdit ? 'Save Changes' : 'Publish Announcement'}</Button>
            <Link to="/coordinator/announcements">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </>
  );
}
