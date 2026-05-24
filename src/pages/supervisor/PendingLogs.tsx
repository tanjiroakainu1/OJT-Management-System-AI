import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  calcHours,
  getDailyLogs,
  getStudentById,
  getSupervisorByUserId,
  getUserById,
  updateDailyLogStatus,
} from '../../lib/db';
import {
  getSupervisorLogsStatusChart,
  getSupervisorPendingByStudentChart,
} from '../../lib/chartData';
import { useDbRefresh } from '../../context/DataContext';
import { BarChartView, ChartCard, PieChartView } from '../../components/charts/Charts';
import { Card, EmptyRow, PageHeader, Table } from '../../components/ui';

export default function PendingLogs() {
  const { user } = useAuth();
  const version = useDbRefresh();
  const supervisor = user ? getSupervisorByUserId(user.id) : null;

  const logs = useMemo(
    () => (supervisor ? getDailyLogs({ companyId: supervisor.company_id, status: 'pending' }) : []),
    [supervisor, version]
  );

  const pendingByStudent = useMemo(
    () => (supervisor ? getSupervisorPendingByStudentChart(supervisor.company_id) : []),
    [supervisor, version]
  );

  const logsByStatus = useMemo(
    () => (supervisor ? getSupervisorLogsStatusChart(supervisor.company_id) : []),
    [supervisor, version]
  );

  const handle = (id: number, status: 'approved' | 'rejected') => {
    const r = prompt('Remarks (optional):') ?? undefined;
    if (user) updateDailyLogStatus(id, status, user.id, r);
  };

  if (!supervisor) return <p>Supervisor profile not found.</p>;

  return (
    <>
      <PageHeader
        title="Pending Daily Logs"
        subtitle={`${logs.length} log(s) awaiting review`}
      />

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Pending Logs by Student">
          <BarChartView data={pendingByStudent} layout="horizontal" color="#d97706" height={280} />
        </ChartCard>
        <ChartCard title="All Logs by Status (your company)">
          <PieChartView data={logsByStatus} />
        </ChartCard>
      </div>

      <Card title="Pending Logs">
        <Table headers={['Student', 'Date', 'Hours', 'Activities', 'Actions']}>
          {logs.length === 0 ? (
            <EmptyRow cols={5} message="No pending logs." />
          ) : (
            logs.map((l) => {
              const s = getStudentById(l.student_id);
              const u = s ? getUserById(s.user_id) : null;
              return (
                <tr key={l.id}>
                  <td className="px-4 py-3 text-sm">{u?.full_name}</td>
                  <td className="px-4 py-3 text-sm">{l.log_date}</td>
                  <td className="px-4 py-3 text-sm">{calcHours(l.time_in, l.time_out)}</td>
                  <td className="px-4 py-3 text-sm max-w-xs truncate">{l.activities}</td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <Link to={`/supervisor/logs/${l.id}`} className="link-action">View</Link>
                    <button type="button" onClick={() => handle(l.id, 'approved')} className="link-edit">Approve</button>
                    <button type="button" onClick={() => handle(l.id, 'rejected')} className="link-danger">Reject</button>
                  </td>
                </tr>
              );
            })
          )}
        </Table>
      </Card>
    </>
  );
}
