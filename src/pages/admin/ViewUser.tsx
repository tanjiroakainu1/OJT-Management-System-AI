import { Link, useParams } from 'react-router-dom';
import {
  getCoordinatorByUserId,
  getStudentByUserId,
  getSupervisorByUserId,
  getUserById,
} from '../../lib/db';
import { Card, PageHeader, RoleBadge } from '../../components/ui';

export default function ViewUser() {
  const { id } = useParams();
  const user = getUserById(Number(id));
  if (!user) return <p>User not found</p>;
  const student = getStudentByUserId(user.id);
  const coordinator = getCoordinatorByUserId(user.id);
  const supervisor = getSupervisorByUserId(user.id);

  return (
    <>
      <PageHeader title={user.full_name} />
      <Card>
        <dl className="text-sm space-y-2">
          <div><dt className="dt-label">Email</dt><dd>{user.email}</dd></div>
          <div><dt className="dt-label">Role</dt><dd><RoleBadge role={user.role} /></dd></div>
          {student && (
            <>
              <div><dt className="dt-label">Student ID</dt><dd>{student.student_id}</dd></div>
              <div><dt className="dt-label">Course</dt><dd>{student.course}</dd></div>
            </>
          )}
          {coordinator && <div><dt className="dt-label">Department</dt><dd>{coordinator.department}</dd></div>}
          {supervisor && <div><dt className="dt-label">Position</dt><dd>{supervisor.position}</dd></div>}
        </dl>
        <Link to={`/admin/users/${user.id}/edit`} className="link-back mt-4 inline-block">Edit User</Link>
      </Card>
      <Link to="/admin/users" className="link-back mt-4 inline-block">← Back</Link>
    </>
  );
}
