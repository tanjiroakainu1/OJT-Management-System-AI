import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  calcHours,
  getCompanyById,
  getDailyLogs,
  getSupervisorByUserId,
  getSupervisorStats,
  getStudentById,
  getUserById,
} from '../../lib/db';
import {
  getSupervisorEvaluationsChart,
  getSupervisorLogsStatusChart,
  getSupervisorStudentHoursChart,
} from '../../lib/chartData';
import { useDbRefresh } from '../../context/DataContext';
import { BarChartView, ChartCard, PieChartView } from '../../components/charts/Charts';
import { Card, PageHeader, StatCard, StatusBadge, Table } from '../../components/ui';

export default function SupervisorDashboard() {
  const { user } = useAuth();
  const version = useDbRefresh();
  const supervisor = user ? getSupervisorByUserId(user.id) : null;

  const company = supervisor ? getCompanyById(supervisor.company_id) : null;
  const stats = useMemo(
    () => (supervisor ? getSupervisorStats(supervisor.company_id, supervisor.id) : null),
    [supervisor, version]
  );
  const recentLogs = useMemo(
    () => (supervisor ? getDailyLogs({ companyId: supervisor.company_id }).slice(0, 5) : []),
    [supervisor, version]
  );
  const logsByStatus = useMemo(
    () => (supervisor ? getSupervisorLogsStatusChart(supervisor.company_id) : []),
    [supervisor, version]
  );
  const studentHours = useMemo(
    () => (supervisor ? getSupervisorStudentHoursChart(supervisor.company_id) : []),
    [supervisor, version]
  );
  const evaluationScores = useMemo(
    () => (supervisor ? getSupervisorEvaluationsChart(supervisor.id) : []),
    [supervisor, version]
  );

  if (!supervisor) return <p>Supervisor profile not found.</p>;

  return (
    <>
      <PageHeader title="Supervisor Dashboard" subtitle={company?.name} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Assigned Students" value={stats?.assigned_students ?? 0} to="/supervisor/students" color="bg-blue-600" />
        <StatCard label="Pending Logs" value={stats?.pending_logs ?? 0} to="/supervisor/logs/pending" color="bg-amber-500" />
        <StatCard label="Evaluations" value={stats?.total_evaluations ?? 0} to="/supervisor/evaluations" color="bg-green-600" />
        <StatCard label="Active OJTs" value={stats?.active_ojts ?? 0} to="/supervisor/students" color="bg-cyan-600" />
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Daily Logs by Status (your company)">
          <PieChartView data={logsByStatus} />
        </ChartCard>
        <ChartCard title="Approved Hours by Student">
          <BarChartView data={studentHours} layout="horizontal" color="#e879f9" height={280} />
        </ChartCard>
        <ChartCard title="Average Evaluation Scores">
          <BarChartView data={evaluationScores} color="#ff4500" height={260} />
        </ChartCard>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Card title="Recent Daily Logs">
            <Table headers={['Student', 'Date', 'Hours', 'Status', '']}>
              {recentLogs.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-4 text-muted">No logs</td></tr>
              ) : (
                recentLogs.map((l) => {
                  const s = getStudentById(l.student_id);
                  const u = s ? getUserById(s.user_id) : null;
                  return (
                    <tr key={l.id}>
                      <td className="px-4 py-2 text-sm">{u?.full_name}</td>
                      <td className="px-4 py-2 text-sm">{l.log_date}</td>
                      <td className="px-4 py-2 text-sm">{calcHours(l.time_in, l.time_out)}</td>
                      <td className="px-4 py-2"><StatusBadge status={l.status} /></td>
                      <td className="px-4 py-2">
                        <Link to={`/supervisor/logs/${l.id}`} className="link-back">View</Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </Table>
          </Card>
        </div>
        <Card title="Quick Actions">
          <div className="space-y-2">
            <Link to="/supervisor/evaluate" className="quick-action-btn">Evaluate Student</Link>
            <Link to="/supervisor/logs/pending" className="quick-action-btn">Review Pending Logs</Link>
            <Link to="/supervisor/attendance" className="quick-action-btn">Attendance Report</Link>
          </div>
          <div className="mt-4 text-sm">
            <p><strong>Position:</strong> {supervisor.position}</p>
            <p><strong>Contact:</strong> {supervisor.contact}</p>
            <p><strong>Email:</strong> {user?.email}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
