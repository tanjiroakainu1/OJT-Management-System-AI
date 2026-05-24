import { Link, useParams } from 'react-router-dom';
import { getApplications, getDailyLogs, getEvaluations, getStudentById, getUserById } from '../../lib/db';
import { Card, PageHeader } from '../../components/ui';

export default function SupervisorViewStudent() {
  const { id } = useParams();
  const student = getStudentById(Number(id));
  if (!student) return <p>Not found</p>;
  const user = getUserById(student.user_id);
  const logs = getDailyLogs({ studentId: student.id });
  const evals = getEvaluations({ studentId: student.id });
  const app = getApplications({ studentId: student.id, status: 'approved' })[0];

  return (
    <>
      <PageHeader title={user?.full_name ?? 'Student'} subtitle={student.student_id} />
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Profile">
          <p className="text-sm">{student.course} Y{student.year} — {student.section}</p>
          <p className="text-sm text-body">{app?.position}</p>
        </Card>
        <Card title="Stats">
          <p className="text-sm">Logs: {logs.length}</p>
          <p className="text-sm">Evaluations: {evals.length}</p>
        </Card>
      </div>
      <div className="flex gap-4 mt-4">
        <Link to={`/supervisor/students/${student.id}/logs`} className="link-back">View Logs</Link>
        <Link to={`/supervisor/evaluate/${student.id}`} className="link-edit text-sm">Evaluate</Link>
        <Link to="/supervisor/students" className="text-body text-sm">← Back</Link>
      </div>
    </>
  );
}
