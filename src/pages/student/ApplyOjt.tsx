import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createApplication, getApplications, getCompanies, getStudentByUserId } from '../../lib/db';
import { Alert, Button, Card, Input, PageHeader, Select } from '../../components/ui';

export default function ApplyOjt() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const student = user ? getStudentByUserId(user.id) : null;
  const existing = student ? getApplications({ studentId: student.id }).filter((a) => a.status === 'pending' || a.status === 'approved') : [];

  const [form, setForm] = useState({ company_id: '', position: '', start_date: '', end_date: '' });
  const [error, setError] = useState('');
  const companies = getCompanies(true);

  if (existing.length > 0) {
    return (
      <>
        <PageHeader title="Apply for OJT" />
        <Alert type="info">You already have an active or pending OJT application.</Alert>
        <Link to="/student" className="link-action">← Back to Dashboard</Link>
      </>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!student) return;
    if (!form.company_id || !form.position || !form.start_date || !form.end_date) {
      setError('Please fill all fields.');
      return;
    }
    createApplication({
      student_id: student.id,
      company_id: Number(form.company_id),
      position: form.position,
      start_date: form.start_date,
      end_date: form.end_date,
    });
    navigate('/student');
  };

  return (
    <>
      <PageHeader title="Apply for OJT" />
      {error && <Alert type="error">{error}</Alert>}
      <Card>
        <form onSubmit={handleSubmit} className="max-w-lg">
          <Select
            label="Company"
            value={form.company_id}
            onChange={(e) => setForm({ ...form, company_id: e.target.value })}
            options={[{ value: '', label: 'Select company...' }, ...companies.map((c) => ({ value: c.id, label: c.name }))]}
          />
          <Input label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
          <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          <Input label="End Date" type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} required />
          <Button type="submit">Submit Application</Button>
        </form>
      </Card>
    </>
  );
}
