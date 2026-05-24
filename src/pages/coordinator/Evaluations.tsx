import { useMemo } from 'react';
import { getEvaluations, getFullState, getStudentById, getUserById } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, EmptyRow, PageHeader, Table } from '../../components/ui';

export default function CoordinatorEvaluations() {
  const version = useDbRefresh();
  const evals = useMemo(() => getEvaluations(), [version]);

  return (
    <>
      <PageHeader title="View Evaluations" />
      <Card>
        <Table headers={['Student', 'Supervisor', 'Date', 'Score', 'Comments']}>
          {evals.length === 0 ? <EmptyRow cols={5} message="No evaluations." /> : evals.map((e) => {
            const s = getStudentById(e.student_id);
            const u = s ? getUserById(s.user_id) : null;
            const sup = getFullState().supervisors.find((x) => x.id === e.supervisor_id);
            const supUser = sup ? getUserById(sup.user_id) : null;
            return (
              <tr key={e.id}>
                <td className="px-4 py-3 text-sm">{u?.full_name}</td>
                <td className="px-4 py-3 text-sm">{supUser?.full_name}</td>
                <td className="px-4 py-3 text-sm">{e.evaluation_date}</td>
                <td className="px-4 py-3 text-sm font-medium">{e.total_score.toFixed(1)}</td>
                <td className="px-4 py-3 text-sm">{e.comments ?? '—'}</td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
