import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getApplicationById,
  getCompanyById,
  getStudentById,
  getUserById,
  updateApplicationStatus,
} from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Button, Card, PageHeader, StatusBadge } from '../../components/ui';

export default function CoordinatorViewApplication() {
  const { id } = useParams();
  const { user } = useAuth();
  const version = useDbRefresh();
  const app = getApplicationById(Number(id));
  if (!app) return <p>Not found</p>;
  const student = getStudentById(app.student_id);
  const u = student ? getUserById(student.user_id) : null;
  const company = getCompanyById(app.company_id);

  const handle = (status: 'approved' | 'rejected') => {
    const r = prompt('Remarks:') ?? undefined;
    if (user) updateApplicationStatus(app.id, status, user.id, r);
  };

  return (
    <>
      <PageHeader title="Application Details" key={version} />
      <Card>
        <dl className="text-sm space-y-2">
          <div><dt className="dt-label">Student</dt><dd>{u?.full_name}</dd></div>
          <div><dt className="dt-label">Company</dt><dd>{company?.name}</dd></div>
          <div><dt className="dt-label">Position</dt><dd>{app.position}</dd></div>
          <div><dt className="dt-label">Dates</dt><dd>{app.start_date} – {app.end_date}</dd></div>
          <div><dt className="dt-label">Status</dt><dd><StatusBadge status={app.status} /></dd></div>
        </dl>
        {app.status === 'pending' && (
          <div className="btn-row mt-4">
            <Button variant="success" onClick={() => handle('approved')}>Approve</Button>
            <Button variant="danger" onClick={() => handle('rejected')}>Reject</Button>
          </div>
        )}
      </Card>
      <Link to="/coordinator/applications" className="link-back mt-4 inline-block">← Back</Link>
    </>
  );
}
