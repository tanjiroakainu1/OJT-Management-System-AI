import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getActivities, getAdminStats, getUserById } from '../../lib/db';
import {
  getDailyLogsStatusChart,
  getOjtLifecycleChart,
  getStudentsByCourseChart,
  getUsersByRoleChart,
} from '../../lib/chartData';
import { useDbRefresh } from '../../context/DataContext';
import { BarChartView, ChartCard, PieChartView } from '../../components/charts/Charts';
import { Card, PageHeader, RoleBadge, StatCard } from '../../components/ui';

export default function AdminDashboard() {
  const version = useDbRefresh();
  const stats = useMemo(() => getAdminStats(), [version]);
  const activities = useMemo(() => getActivities(10), [version]);
  const usersByRole = useMemo(() => getUsersByRoleChart(), [version]);
  const ojtLifecycle = useMemo(() => getOjtLifecycleChart(), [version]);
  const studentsByCourse = useMemo(() => getStudentsByCourseChart(), [version]);
  const logsByStatus = useMemo(() => getDailyLogsStatusChart(), [version]);

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="System Overview and Statistics" />
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Students" value={stats.total_students} to="/admin/students" color="bg-blue-600" />
        <StatCard label="Companies" value={stats.total_companies} to="/admin/companies" color="bg-green-600" />
        <StatCard label="Coordinators" value={stats.total_coordinators} to="/admin/users?role=coordinator" color="bg-cyan-600" />
        <StatCard label="Supervisors" value={stats.total_supervisors} to="/admin/users?role=supervisor" color="bg-amber-500" />
        <StatCard label="Pending Applications" value={stats.pending_applications} to="/admin/applications?status=pending" color="bg-red-600" />
        <StatCard label="Active OJTs" value={stats.active_ojts} to="/admin/applications?status=active" color="bg-gray-600" />
        <StatCard label="Completed OJTs" value={stats.completed_ojts} to="/admin/applications?status=completed" color="bg-gray-800" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Users by Role">
          <PieChartView data={usersByRole} />
        </ChartCard>
        <ChartCard title="OJT Application Status">
          <PieChartView data={ojtLifecycle} />
        </ChartCard>
        <ChartCard title="Students by Course">
          <BarChartView data={studentsByCourse} layout="horizontal" color="#e879f9" />
        </ChartCard>
        <ChartCard title="Daily Logs by Status">
          <PieChartView data={logsByStatus} />
        </ChartCard>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card title="Quick Actions">
          <div className="space-y-2">
            <Link to="/admin/users/new" className="dashboard-link">Add New User</Link>
            <Link to="/admin/companies/new" className="dashboard-link">Add New Company</Link>
            <Link to="/admin/reports" className="dashboard-link">View Reports</Link>
          </div>
        </Card>
        <Card title="Recent System Activities">
          {activities.length === 0 ? (
            <p className="text-muted text-sm">No recent activities.</p>
          ) : (
            <ul className="space-y-3">
              {activities.map((a) => {
                const u = getUserById(a.user_id);
                return (
                  <li key={a.id} className="text-sm border-b pb-2">
                    <span className="font-medium">{u?.email}</span>{' '}
                    {u && <RoleBadge role={u.role} />}{' '}
                    <span className="capitalize">{a.action}</span>d {a.entity}
                    {a.entity_id && ` #${a.entity_id}`}
                    <span className="block text-xs text-zinc-500">
                      {new Date(a.created_at).toLocaleString()}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}
