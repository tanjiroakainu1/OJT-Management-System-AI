import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  createUser,
  getCompanies,
  getCoordinatorByUserId,
  getStudentByUserId,
  getSupervisorByUserId,
  getUserById,
  updateUser,
} from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Alert, Button, Card, Input, PageHeader, Select } from '../../components/ui';
import type { UserRole } from '../../types';

export default function UserForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const defaultRole = (searchParams.get('role') as UserRole) || 'student';

  const existing = id ? getUserById(Number(id)) : null;
  const student = existing ? getStudentByUserId(existing.id) : null;
  const coordinator = existing ? getCoordinatorByUserId(existing.id) : null;
  const supervisor = existing ? getSupervisorByUserId(existing.id) : null;

  const [role, setRole] = useState<UserRole>(existing?.role ?? defaultRole);
  const [form, setForm] = useState({
    full_name: existing?.full_name ?? '',
    email: existing?.email ?? '',
    password: '',
    student_id: student?.student_id ?? '',
    course: student?.course ?? '',
    year: student?.year ?? 4,
    section: student?.section ?? 'A',
    contact: student?.contact ?? coordinator?.contact ?? supervisor?.contact ?? '',
    address: student?.address ?? '',
    department: coordinator?.department ?? '',
    position: supervisor?.position ?? '',
    company_id: supervisor?.company_id ?? 1,
  });
  const [error, setError] = useState('');

  const version = useDbRefresh();
  const companies = useMemo(() => getCompanies(true), [version]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isEdit && !form.password) {
      setError('Password is required.');
      return;
    }
    const roleData: Record<string, unknown> = {};
    if (role === 'student') {
      Object.assign(roleData, {
        student_id: form.student_id,
        course: form.course,
        year: form.year,
        section: form.section,
        contact: form.contact,
        address: form.address,
      });
    } else if (role === 'coordinator') {
      Object.assign(roleData, { department: form.department, contact: form.contact });
    } else if (role === 'supervisor') {
      Object.assign(roleData, {
        company_id: form.company_id,
        position: form.position,
        contact: form.contact,
      });
    }
    if (isEdit && existing) {
      const result = await updateUser(
        existing.id,
        {
          full_name: form.full_name,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
        },
        roleData
      );
      if (!result.ok) {
        setError(result.error ?? 'Failed to update user.');
        return;
      }
      navigate(`/admin/users/${existing.id}`);
    } else {
      const result = await createUser(
        {
          full_name: form.full_name,
          email: form.email,
          password: form.password,
          role,
        },
        roleData
      );
      if ('error' in result) {
        setError(result.error);
        return;
      }
      navigate('/admin/users');
    }
  };

  return (
    <>
      <PageHeader title={isEdit ? 'Edit User' : 'Add User'} />
      {error && <Alert type="error">{error}</Alert>}
      <Card>
        <form onSubmit={handleSubmit} className="max-w-lg">
          {!isEdit && (
            <Select
              label="Role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'coordinator', label: 'Coordinator' },
                { value: 'supervisor', label: 'Supervisor' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
          )}
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Input label={isEdit ? 'New Password (optional)' : 'Password'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!isEdit} />
          {role === 'student' && (
            <>
              <Input label="Student ID" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} />
              <Input label="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
              <Input label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
              <Input label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
              <Input label="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
              <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </>
          )}
          {role === 'coordinator' && (
            <>
              <Input label="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
              <Input label="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </>
          )}
          {role === 'supervisor' && (
            <>
              <Select
                label="Company"
                value={form.company_id}
                onChange={(e) => setForm({ ...form, company_id: Number(e.target.value) })}
                options={companies.map((c) => ({ value: c.id, label: c.name }))}
              />
              <Input label="Position" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              <Input label="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            </>
          )}
          <div className="btn-row">
            <Button type="submit">{isEdit ? 'Save' : 'Create'}</Button>
            <Link to="/admin/users"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </>
  );
}
