import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { calcHours, getApplications, getDailyLogs, getStudentByUserId } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Button, Card, EmptyRow, PageHeader, StatusBadge, Table } from '../../components/ui';

export default function StudentDailyLogs() {
  const { user } = useAuth();
  const version = useDbRefresh();
  const student = user ? getStudentByUserId(user.id) : null;
  const approved = useMemo(
    () => (student ? getApplications({ studentId: student.id, status: 'approved' }).length > 0 : false),
    [student, version]
  );
  const logs = useMemo(
    () => (student ? getDailyLogs({ studentId: student.id }) : []),
    [student, version]
  );

  if (!approved) {
    return (
      <>
        <PageHeader title="Daily Logs" />
        <Card><p className="text-body">You need an approved OJT application before logging daily activities.</p></Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Daily Logs" />
      <Link to="/student/logs/new" className="inline-block mb-4"><Button>Add Log</Button></Link>
      <Card>
        <Table headers={['Date', 'Time In', 'Time Out', 'Hours', 'Status', 'Actions']}>
          {logs.length === 0 ? <EmptyRow cols={6} message="No logs yet." /> : logs.map((l) => (
            <tr key={l.id}>
              <td className="px-4 py-3 text-sm">{l.log_date}</td>
              <td className="px-4 py-3 text-sm">{l.time_in}</td>
              <td className="px-4 py-3 text-sm">{l.time_out}</td>
              <td className="px-4 py-3 text-sm">{calcHours(l.time_in, l.time_out)}</td>
              <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
              <td className="px-4 py-3 text-sm">
                <Link to={`/student/logs/${l.id}`} className="link-action">View</Link>
                {l.status !== 'approved' && (
                  <> · <Link to={`/student/logs/${l.id}/edit`} className="link-edit">Edit</Link></>
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
