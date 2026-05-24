import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createDailyLog, getDailyLogById, getStudentByUserId, updateDailyLog } from '../../lib/db';
import { Alert, Button, Card, Input, PageHeader, Textarea } from '../../components/ui';

export default function LogForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const student = user ? getStudentByUserId(user.id) : null;
  const isEdit = Boolean(id);
  const existing = isEdit ? getDailyLogById(Number(id)) : null;

  const [form, setForm] = useState({
    log_date: existing?.log_date ?? new Date().toISOString().split('T')[0],
    time_in: existing?.time_in ?? '08:00',
    time_out: existing?.time_out ?? '17:00',
    activities: existing?.activities ?? '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (isEdit && existing) {
      const result = updateDailyLog(existing.id, form);
      if (!result.ok) { setError(result.error ?? 'Failed'); return; }
      navigate(`/student/logs/${existing.id}`);
    } else {
      const result = createDailyLog({ student_id: student.id, ...form });
      if (!result.ok) { setError(result.error ?? 'Failed'); return; }
      navigate('/student/logs');
    }
  };

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Log' : 'Add Daily Log'} />
      {error && <Alert type="error">{error}</Alert>}
      <Card>
        <form onSubmit={handleSubmit} className="max-w-lg">
          <Input label="Date" type="date" value={form.log_date} onChange={(e) => setForm({ ...form, log_date: e.target.value })} required />
          <Input label="Time In" type="time" value={form.time_in} onChange={(e) => setForm({ ...form, time_in: e.target.value })} required />
          <Input label="Time Out" type="time" value={form.time_out} onChange={(e) => setForm({ ...form, time_out: e.target.value })} required />
          <Textarea label="Activities" value={form.activities} onChange={(e) => setForm({ ...form, activities: e.target.value })} required />
          <Button type="submit">{isEdit ? 'Save' : 'Submit'}</Button>
          <Link to="/student/logs" className="ml-2 text-sm text-body">Cancel</Link>
        </form>
      </Card>
    </>
  );
}
