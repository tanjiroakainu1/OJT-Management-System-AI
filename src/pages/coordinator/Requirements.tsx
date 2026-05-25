import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  deleteOjtRequirement,
  deleteStudentRequirement,
  getOjtRequirements,
  getRequirementSubmissionCount,
  getStudentById,
  getStudentRequirements,
  getUserById,
  updateStudentRequirementStatus,
} from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { RequirementFileLink } from '../../components/RequirementFile';
import { Alert, Button, Card, EmptyRow, PageHeader, StatusBadge, Table } from '../../components/ui';

export default function CoordinatorRequirements() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const status = params.get('status') ?? '';
  const version = useDbRefresh();

  const templates = useMemo(() => getOjtRequirements(), [version]);

  const submissions = useMemo(() => {
    const subs = getStudentRequirements(
      status ? { status: status as 'pending' | 'approved' | 'rejected' } : undefined
    );
    return subs.map((sub) => {
      const req = templates.find((r) => r.id === sub.requirement_id);
      const student = getStudentById(sub.student_id);
      const u = student ? getUserById(student.user_id) : null;
      return { ...sub, req, student, user: u };
    });
  }, [status, version, templates]);

  const handleReview = (id: number, action: 'approved' | 'rejected') => {
    const r = prompt('Remarks (optional):') ?? undefined;
    if (user) updateStudentRequirementStatus(id, action, user.id, r);
  };

  const handleDeleteTemplate = (id: number, name: string) => {
    const count = getRequirementSubmissionCount(id);
    const msg =
      count > 0
        ? `Delete "${name}"? This will also remove ${count} student submission(s).`
        : `Delete requirement "${name}"?`;
    if (!confirm(msg)) return;
    const result = deleteOjtRequirement(id);
    if (!result.ok) alert(result.error ?? 'Could not delete requirement.');
  };

  const handleDeleteSubmission = (id: number) => {
    if (!confirm('Delete this student submission?')) return;
    deleteStudentRequirement(id);
  };

  return (
    <>
      <PageHeader
        title="Manage Requirements"
        subtitle="Create requirement templates and review student submissions"
      />

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-zinc-100">Requirement Templates</h2>
        <Link to="/coordinator/requirements/new">
          <Button>Add Requirement</Button>
        </Link>
      </div>

      <Card className="mb-8">
        <Table headers={['Name', 'Description', 'Deadline', 'Submissions', 'Actions']}>
          {templates.length === 0 ? (
            <EmptyRow cols={5} message="No requirements defined yet. Click Add Requirement to create one." />
          ) : (
            templates.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 text-sm font-medium">{r.name}</td>
                <td className="px-4 py-3 text-sm max-w-xs truncate" title={r.description}>
                  {r.description}
                </td>
                <td className="px-4 py-3 text-sm">{r.deadline}</td>
                <td className="px-4 py-3 text-sm">{getRequirementSubmissionCount(r.id)}</td>
                <td className="px-4 py-3 text-sm space-x-2 whitespace-nowrap">
                  <Link
                    to={`/coordinator/requirements/${r.id}/edit`}
                    className="link-edit"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteTemplate(r.id, r.name)}
                    className="link-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <h2 className="text-lg font-semibold text-zinc-100">Student Submissions</h2>
        <div className="btn-row">
          {['', 'pending', 'approved', 'rejected'].map((s) => (
            <Link
              key={s}
              to={
                s
                  ? `/coordinator/requirements?status=${s}`
                  : '/coordinator/requirements'
              }
              className={`px-3 py-1 rounded text-sm ${
                status === s ? 'filter-pill-active' : 'filter-pill'
              }`}
            >
              {s || 'All'}
            </Link>
          ))}
        </div>
      </div>

      <Card>
        <Table headers={['Student', 'Requirement', 'File', 'Status', 'Actions']}>
          {submissions.length === 0 ? (
            <EmptyRow cols={5} message="No submissions for this filter." />
          ) : (
            submissions.map((sub) => (
              <tr key={sub.id}>
                <td className="px-4 py-3 text-sm">
                  {sub.user?.full_name}
                  <span className="block text-xs text-muted">{sub.student?.student_id}</span>
                </td>
                <td className="px-4 py-3 text-sm">{sub.req?.name ?? '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <RequirementFileLink filePath={sub.file_path} fileName={sub.file_name} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={sub.status} />
                </td>
                <td className="px-4 py-3 text-sm space-x-2 whitespace-nowrap">
                  {sub.status === 'pending' && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleReview(sub.id, 'approved')}
                        className="link-edit"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReview(sub.id, 'rejected')}
                        className="link-danger"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteSubmission(sub.id)}
                    className="link-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {templates.length > 0 && submissions.length === 0 && status === '' && (
        <Alert type="info">
          Students can upload files for each requirement from their Requirements page after
          logging in.
        </Alert>
      )}
    </>
  );
}
