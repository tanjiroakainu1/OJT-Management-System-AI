import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calcHours, getDailyLogs, getStudentById, getUserById, updateDailyLogStatus } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, EmptyRow, PageHeader, StatusBadge, Table } from '../../components/ui';

export default function StudentLogs() {
  const { id } = useParams();
  const { user } = useAuth();
  const version = useDbRefresh();
  const student = getStudentById(Number(id));
  if (!student) return <p>Not found</p>;
  const u = getUserById(student.user_id);
  const logs = getDailyLogs({ studentId: student.id });

  const handle = (logId: number, status: 'approved' | 'rejected') => {
    const r = prompt('Remarks:') ?? undefined;
    if (user) updateDailyLogStatus(logId, status, user.id, r);
  };

  return (
    <>
      <PageHeader title={`Logs — ${u?.full_name}`} key={version} />
      <Card>
        <Table headers={['Date', 'Hours', 'Status', 'Actions']}>
          {logs.length === 0 ? <EmptyRow cols={4} message="No logs." /> : logs.map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-3 text-sm">{l.log_date}</td>
              <td className="px-4 py-3 text-sm">{calcHours(l.time_in, l.time_out)}</td>
              <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
              <td className="px-4 py-3 text-sm space-x-2">
                <Link to={`/supervisor/logs/${l.id}`} className="link-action">View</Link>
                {l.status === 'pending' && (
                  <>
                    <button type="button" onClick={() => handle(l.id, 'approved')} className="link-edit">Approve</button>
                    <button type="button" onClick={() => handle(l.id, 'rejected')} className="link-danger">Reject</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
      <Link to={`/supervisor/students/${student.id}`} className="link-back mt-4 inline-block">← Back</Link>
    </>
  );
}
