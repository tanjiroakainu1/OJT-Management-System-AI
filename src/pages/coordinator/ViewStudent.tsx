import { Link, useParams } from 'react-router-dom';
import { getApplications, getDailyLogs, getStudentById, getUserById } from '../../lib/db';
import { Card, PageHeader, StatusBadge } from '../../components/ui';

export default function CoordinatorViewStudent() {
  const { id } = useParams();
  const student = getStudentById(Number(id));
  if (!student) return <p>Not found</p>;
  const user = getUserById(student.user_id);
  const apps = getApplications({ studentId: student.id });
  const logs = getDailyLogs({ studentId: student.id });

  return (
    <>
      <PageHeader title={user?.full_name ?? ''} subtitle={student.student_id} />
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Profile">
          <p className="text-sm">{student.course} Year {student.year}, Section {student.section}</p>
          <p className="text-sm">{student.contact}</p>
          <p className="text-sm">{student.address}</p>
          <Link to={`/coordinator/students/${student.id}/edit`} className="link-back mt-2 inline-block">Edit</Link>
        </Card>
        <Card title="Applications">
          {apps.map((a) => (
            <div key={a.id} className="flex justify-between border-b py-2 text-sm">
              <span>{a.position}</span>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </Card>
        <Card title="Recent Logs">
          {logs.slice(0, 5).map((l) => (
            <div key={l.id} className="flex justify-between border-b py-2 text-sm">
              <span>{l.log_date}</span>
              <StatusBadge status={l.status} />
            </div>
          ))}
        </Card>
      </div>
      <Link to="/coordinator/students" className="link-back mt-4 inline-block">← Back</Link>
    </>
  );
}
