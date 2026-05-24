import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calcHours, getDailyLogById, updateDailyLogStatus } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Button, Card, PageHeader, StatusBadge } from '../../components/ui';

export default function SupervisorViewLog() {
  const { id } = useParams();
  const { user } = useAuth();
  const version = useDbRefresh();
  const log = getDailyLogById(Number(id));
  if (!log) return <p>Log not found.</p>;

  const handle = (status: 'approved' | 'rejected') => {
    const r = prompt('Remarks:') ?? undefined;
    if (user) updateDailyLogStatus(log.id, status, user.id, r);
  };

  return (
    <>
      <PageHeader title="Review Daily Log" key={version} />
      <Card>
        <dl className="text-sm space-y-2 mb-4">
          <div><dt className="dt-label">Date</dt><dd>{log.log_date}</dd></div>
          <div><dt className="dt-label">Time</dt><dd>{log.time_in} – {log.time_out} ({calcHours(log.time_in, log.time_out)})</dd></div>
          <div><dt className="dt-label">Status</dt><dd><StatusBadge status={log.status} /></dd></div>
          <div><dt className="dt-label">Activities</dt><dd className="whitespace-pre-wrap">{log.activities}</dd></div>
        </dl>
        {log.status === 'pending' && (
          <div className="flex gap-2">
            <Button variant="success" onClick={() => handle('approved')}>Approve</Button>
            <Button variant="danger" onClick={() => handle('rejected')}>Reject</Button>
          </div>
        )}
      </Card>
      <Link to="/supervisor/logs/pending" className="link-back mt-4 inline-block">← Back</Link>
    </>
  );
}
