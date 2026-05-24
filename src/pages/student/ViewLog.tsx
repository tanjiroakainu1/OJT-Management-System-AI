import { Link, useParams } from 'react-router-dom';
import { calcHours, getDailyLogById } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, PageHeader, StatusBadge } from '../../components/ui';

export default function ViewLog() {
  const { id } = useParams();
  const version = useDbRefresh();
  const log = getDailyLogById(Number(id));
  if (!log) return <p>Log not found.</p>;

  return (
    <>
      <PageHeader title="Daily Log Details" key={version} />
      <Card>
        <dl className="text-sm space-y-2">
          <div><dt className="dt-label">Date</dt><dd>{log.log_date}</dd></div>
          <div><dt className="dt-label">Time</dt><dd>{log.time_in} – {log.time_out} ({calcHours(log.time_in, log.time_out)} hrs)</dd></div>
          <div><dt className="dt-label">Status</dt><dd><StatusBadge status={log.status} /></dd></div>
          <div><dt className="dt-label">Activities</dt><dd className="whitespace-pre-wrap">{log.activities}</dd></div>
          {log.remarks && <div><dt className="dt-label">Remarks</dt><dd>{log.remarks}</dd></div>}
        </dl>
        {log.status !== 'approved' && (
          <Link to={`/student/logs/${log.id}/edit`} className="link-back mt-4 inline-block">Edit</Link>
        )}
      </Card>
      <Link to="/student/logs" className="link-back mt-4 inline-block">← Back</Link>
    </>
  );
}
