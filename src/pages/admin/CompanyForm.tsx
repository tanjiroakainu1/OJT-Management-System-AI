import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createCompany, getCompanyById, updateCompany } from '../../lib/db';
import { Button, Card, Input, PageHeader } from '../../components/ui';

export default function CompanyForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const existing = id ? getCompanyById(Number(id)) : null;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    address: existing?.address ?? '',
    contact_person: existing?.contact_person ?? '',
    contact_number: existing?.contact_number ?? '',
    email: existing?.email ?? '',
  });
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (isEdit && existing) {
      updateCompany(existing.id, form);
      navigate(`/admin/companies/${existing.id}`);
    } else {
      createCompany({ ...form, status: 'active' });
      navigate('/admin/companies');
    }
  };

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Company' : 'Add Company'} />
      <Card>
        <form onSubmit={handleSubmit} className="max-w-lg">
          <Input label="Company Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <Input label="Contact Person" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} required />
          <Input label="Contact Number" value={form.contact_number} onChange={(e) => setForm({ ...form, contact_number: e.target.value })} required />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <div className="flex gap-2">
            <Button type="submit">{isEdit ? 'Save' : 'Create'}</Button>
            <Link to="/admin/companies"><Button type="button" variant="secondary">Cancel</Button></Link>
          </div>
        </form>
      </Card>
    </>
  );
}
