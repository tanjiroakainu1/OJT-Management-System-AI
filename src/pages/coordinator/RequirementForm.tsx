import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  createOjtRequirement,
  getOjtRequirementById,
  updateOjtRequirement,
} from '../../lib/db';
import { Alert, Button, Card, Input, PageHeader, Textarea } from '../../components/ui';

export default function RequirementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = Boolean(id);
  const existing = id ? getOjtRequirementById(Number(id)) : undefined;

  const [form, setForm] = useState({
    name: existing?.name ?? '',
    description: existing?.description ?? '',
    deadline: existing?.deadline ?? '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.description.trim() || !form.deadline) {
      setError('Please fill in all fields.');
      return;
    }
    if (!user) return;

    if (isEdit && existing) {
      const result = updateOjtRequirement(existing.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        deadline: form.deadline,
      });
      if (!result.ok) {
        setError(result.error ?? 'Failed to update requirement.');
        return;
      }
    } else {
      createOjtRequirement({
        name: form.name.trim(),
        description: form.description.trim(),
        deadline: form.deadline,
        created_by: user.id,
      });
    }
    navigate('/coordinator/requirements');
  };

  if (isEdit && !existing) {
    return (
      <>
        <PageHeader title="Edit Requirement" />
        <Alert type="error">Requirement not found.</Alert>
        <Link to="/coordinator/requirements" className="link-back">← Back</Link>
      </>
    );
  }

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Requirement' : 'Add Requirement'} />
      {error && <Alert type="error">{error}</Alert>}
      <Card>
        <form onSubmit={handleSubmit} className="max-w-lg">
          <Input
            label="Requirement Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Textarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <Input
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            required
          />
          <div className="flex gap-2">
            <Button type="submit">{isEdit ? 'Save Changes' : 'Create Requirement'}</Button>
            <Link to="/coordinator/requirements">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
          </div>
        </form>
      </Card>
    </>
  );
}
