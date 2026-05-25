import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getApplicationById,
  getApplicationRemarks,
  getCompanyById,
  getStudentById,
  getUserById,
  updateApplicationStatus,
} from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Button, Card, PageHeader, StatusBadge } from '../../components/ui';

export default function ViewApplication() {
  const { id } = useParams();
  const { user } = useAuth();
  const version = useDbRefresh();
  const app = getApplicationById(Number(id));

  if (!app) return <p>Application not found.</p>;

  const student = getStudentById(app.student_id);
  const u = student ? getUserById(student.user_id) : null;
  const company = getCompanyById(app.company_id);
  const remarks = getApplicationRemarks(app.id);

  const handle = (status: 'approved' | 'rejected') => {
    const r = prompt('Remarks:') ?? undefined;
    if (user) updateApplicationStatus(app.id, status, user.id, r);
  };

  return (
    <>
      <PageHeader title="Application Details" key={version} />
      <Card>
        <dl className="grid md:grid-cols-2 gap-4 text-sm">
          <div><dt className="dt-label">Student</dt><dd>{u?.full_name} ({student?.student_id})</dd></div>
          <div><dt className="dt-label">Company</dt><dd>{company?.name}</dd></div>
          <div><dt className="dt-label">Position</dt><dd>{app.position}</dd></div>
          <div><dt className="dt-label">Status</dt><dd><StatusBadge status={app.status} /></dd></div>
          <div><dt className="dt-label">Start Date</dt><dd>{app.start_date}</dd></div>
          <div><dt className="dt-label">End Date</dt><dd>{app.end_date}</dd></div>
        </dl>
        {app.status === 'pending' && (
          <div className="btn-row mt-4">
            <Button variant="success" onClick={() => handle('approved')}>Approve</Button>
            <Button variant="danger" onClick={() => handle('rejected')}>Reject</Button>
          </div>
        )}
        {remarks.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Remarks History</h4>
            {remarks.map((r) => (
              <p key={r.id} className="text-sm border-l-2 pl-3 mb-2">{r.remarks}</p>
            ))}
          </div>
        )}
      </Card>
      <Link to="/admin/applications" className="link-back mt-4 inline-block">← Back</Link>
    </>
  );
}
