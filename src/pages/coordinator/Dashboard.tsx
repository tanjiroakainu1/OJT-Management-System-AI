import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getApplications, getCompanyById, getCoordinatorStats, getStudentById, getUserById } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, PageHeader, StatCard, StatusBadge, Table } from '../../components/ui';

export default function CoordinatorDashboard() {
  const version = useDbRefresh();
  const stats = useMemo(() => getCoordinatorStats(), [version]);
  const apps = useMemo(() => getApplications().slice(0, 5), [version]);

  return (
    <>
      <PageHeader title="Coordinator Dashboard" subtitle="OJT Management Panel" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={stats.student_count} to="/coordinator/students" color="bg-blue-600" />
        <StatCard label="Pending Applications" value={stats.pending_apps} to="/coordinator/applications?status=pending" color="bg-amber-500" />
        <StatCard label="Approved OJTs" value={stats.approved_apps} to="/coordinator/applications?status=approved" color="bg-green-600" />
        <StatCard label="Pending Requirements" value={stats.pending_requirements} to="/coordinator/requirements?status=pending" color="bg-cyan-600" />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Recent Applications">
          <Table headers={['Student', 'Company', 'Status', '']}>
            {apps.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-4 text-muted">No applications</td></tr>
            ) : (
              apps.map((a) => {
                const s = getStudentById(a.student_id);
                const u = s ? getUserById(s.user_id) : null;
                return (
                  <tr key={a.id}>
                    <td className="px-4 py-2 text-sm">{u?.full_name}</td>
                    <td className="px-4 py-2 text-sm">{getCompanyById(a.company_id)?.name}</td>
                    <td className="px-4 py-2"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-2"><Link to={`/coordinator/applications/${a.id}`} className="link-back">View</Link></td>
                  </tr>
                );
              })
            )}
          </Table>
        </Card>
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-2">
            <Link to="/coordinator/requirements/new" className="quick-action-btn">Add Requirement</Link>
            <Link to="/coordinator/reports" className="quick-action-btn">Reports</Link>
            <Link to="/coordinator/evaluations" className="quick-action-btn">Evaluations</Link>
            <Link to="/coordinator/announcements" className="quick-action-btn">Announcements</Link>
          </div>
        </Card>
      </div>
    </>
  );
}
