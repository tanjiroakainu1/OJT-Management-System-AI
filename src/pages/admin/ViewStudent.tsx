import { Link, useParams } from 'react-router-dom';
import { getApplications, getDailyLogs, getEvaluations, getStudentById, getUserById } from '../../lib/db';
import { Card, PageHeader, StatusBadge } from '../../components/ui';

export default function ViewStudent() {
  const { id } = useParams();
  const student = getStudentById(Number(id));
  if (!student) return <p>Student not found.</p>;
  const user = getUserById(student.user_id);
  const apps = getApplications({ studentId: student.id });
  const logs = getDailyLogs({ studentId: student.id });
  const evals = getEvaluations({ studentId: student.id });

  return (
    <>
      <PageHeader title={user?.full_name ?? 'Student'} subtitle={student.student_id} />
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Profile">
          <dl className="text-sm space-y-2">
            <div><dt className="dt-label">Course</dt><dd>{student.course} — Year {student.year}, Section {student.section}</dd></div>
            <div><dt className="dt-label">Contact</dt><dd>{student.contact}</dd></div>
            <div><dt className="dt-label">Address</dt><dd>{student.address}</dd></div>
            <div><dt className="dt-label">Email</dt><dd>{user?.email}</dd></div>
          </dl>
          <Link to={`/admin/users/${student.user_id}/edit`} className="link-back mt-4 inline-block">Edit Profile</Link>
        </Card>
        <Card title={`Applications (${apps.length})`}>
          {apps.map((a) => (
            <div key={a.id} className="border-b py-2 text-sm flex justify-between">
              <span>{a.position}</span>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </Card>
        <Card title={`Daily Logs (${logs.length})`}>
          {logs.slice(0, 5).map((l) => (
            <div key={l.id} className="border-b py-2 text-sm flex justify-between">
              <span>{l.log_date}</span>
              <StatusBadge status={l.status} />
            </div>
          ))}
        </Card>
        <Card title={`Evaluations (${evals.length})`}>
          {evals.map((e) => (
            <div key={e.id} className="border-b py-2 text-sm">Score: {e.total_score.toFixed(1)} / 5</div>
          ))}
        </Card>
      </div>
      <Link to="/admin/students" className="link-back mt-4 inline-block">← Back to Students</Link>
    </>
  );
}
