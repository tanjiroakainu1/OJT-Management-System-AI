import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getApplications,
  getDailyLogs,
  getEvaluations,
  getStudentById,
  getSupervisorByUserId,
  getUserById,
} from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, EmptyRow, PageHeader, Table } from '../../components/ui';

export default function AssignedStudents() {
  const { user } = useAuth();
  const version = useDbRefresh();
  const supervisor = user ? getSupervisorByUserId(user.id) : null;
  const [search, setSearch] = useState('');

  const students = useMemo(() => {
    if (!supervisor) return [];
    const today = new Date().toISOString().split('T')[0];
    const apps = getApplications({
      companyId: supervisor.company_id,
      status: 'approved',
    }).filter((a) => a.start_date <= today && a.end_date >= today);

    return apps
      .map((a) => {
        const s = getStudentById(a.student_id);
        const u = s ? getUserById(s.user_id) : null;
        const logs = getDailyLogs({ studentId: a.student_id });
        const evals = getEvaluations({ studentId: a.student_id, supervisorId: supervisor.id });
        return { student: s, user: u, app: a, logCount: logs.length, hasEval: evals.length > 0 };
      })
      .filter((x) => x.student && (!search || x.user?.full_name.toLowerCase().includes(search.toLowerCase())));
  }, [supervisor, search, version]);

  return (
    <>
      <PageHeader title="Assigned Students" />
      <input className="border rounded-lg px-3 py-2 mb-4 max-w-xs" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
      <Card>
        <Table headers={['Student', 'Position', 'Logs', 'Evaluated', 'Actions']}>
          {students.length === 0 ? <EmptyRow cols={5} message="No assigned students." /> : students.map(({ student, user: u, app, logCount, hasEval }) => (
            <tr key={student!.id}>
              <td className="px-4 py-3 text-sm">{u?.full_name} ({student!.student_id})</td>
              <td className="px-4 py-3 text-sm">{app.position}</td>
              <td className="px-4 py-3 text-sm">{logCount}</td>
              <td className="px-4 py-3 text-sm">{hasEval ? 'Yes' : 'No'}</td>
              <td className="px-4 py-3 text-sm space-x-2">
                <Link to={`/supervisor/students/${student!.id}`} className="link-action">View</Link>
                <Link to={`/supervisor/students/${student!.id}/logs`} className="link-edit">Logs</Link>
                <Link to={`/supervisor/evaluate/${student!.id}`} className="text-amber-600">Evaluate</Link>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
