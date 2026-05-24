import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getStudentById, getUserById, updateUser } from '../../lib/db';
import { Button, Card, Input, PageHeader } from '../../components/ui';

export default function CoordinatorEditStudent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const student = getStudentById(Number(id));
  if (!student) return <p>Not found</p>;
  const user = getUserById(student.user_id)!;
  const [form, setForm] = useState({
    full_name: user.full_name,
    email: user.email,
    student_id: student.student_id,
    course: student.course,
    year: student.year,
    section: student.section,
    contact: student.contact,
    address: student.address,
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await updateUser(student.user_id, { full_name: form.full_name, email: form.email }, {
      student_id: form.student_id,
      course: form.course,
      year: form.year,
      section: form.section,
      contact: form.contact,
      address: form.address,
    });
    navigate(`/coordinator/students/${student.id}`);
  };

  return (
    <>
      <PageHeader title="Edit Student" />
      <Card>
        <form onSubmit={handleSubmit} className="max-w-lg">
          <Input label="Full Name" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input label="Student ID" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })} />
          <Input label="Course" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} />
          <Input label="Year" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: Number(e.target.value) })} />
          <Input label="Section" value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} />
          <Input label="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <Button type="submit">Save</Button>
          <Link to={`/coordinator/students/${student.id}`} className="ml-2 text-sm text-body">Cancel</Link>
        </form>
      </Card>
    </>
  );
}
