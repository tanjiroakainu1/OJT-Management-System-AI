import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEvaluations, getStudentById, getSupervisorByUserId, getUserById } from '../../lib/db';
import { Card, EmptyRow, PageHeader, Table } from '../../components/ui';

export default function SupervisorEvaluations() {
  const { user } = useAuth();
  const supervisor = user ? getSupervisorByUserId(user.id) : null;
  const evals = supervisor ? getEvaluations({ supervisorId: supervisor.id }) : [];

  return (
    <>
      <PageHeader title="Evaluations" />
      <Link to="/supervisor/evaluate" className="inline-block mb-4 link-back">+ New Evaluation</Link>
      <Card>
        <Table headers={['Student', 'Date', 'Score', 'Comments', 'Actions']}>
          {evals.length === 0 ? <EmptyRow cols={5} message="No evaluations yet." /> : evals.map((e) => {
            const s = getStudentById(e.student_id);
            const u = s ? getUserById(s.user_id) : null;
            return (
              <tr key={e.id}>
                <td className="px-4 py-3 text-sm">{u?.full_name}</td>
                <td className="px-4 py-3 text-sm">{e.evaluation_date}</td>
                <td className="px-4 py-3 text-sm font-medium">{e.total_score.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm">{e.comments ?? '—'}</td>
                <td className="px-4 py-3 text-sm">
                  <Link to={`/supervisor/evaluate/${e.student_id}`} className="link-action">Edit</Link>
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
