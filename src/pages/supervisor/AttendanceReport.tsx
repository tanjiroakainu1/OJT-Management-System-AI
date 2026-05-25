import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BarChartView, ChartCard, PieChartView } from '../../components/charts/Charts';
import type { ChartPoint } from '../../lib/chartData';
import {
  calcHours,
  getApplications,
  getDailyLogs,
  getStudentById,
  getSupervisorByUserId,
  getUserById,
} from '../../lib/db';
import type { DailyLog } from '../../types';
import {
  Card,
  EmptyRow,
  PageHeader,
  Select,
  StatCard,
  StatusBadge,
  Table,
  tableCell,
  tableCellMedium,
} from '../../components/ui';

function logMinutes(l: DailyLog): number {
  const [inH, inM] = l.time_in.split(':').map(Number);
  const [outH, outM] = l.time_out.split(':').map(Number);
  return outH * 60 + outM - (inH * 60 + inM);
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatWeekday(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function studentInitials(name?: string): string {
  return (name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function AttendanceReport() {
  const { user } = useAuth();
  const supervisor = user ? getSupervisorByUserId(user.id) : null;
  const [studentId, setStudentId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const students = useMemo(() => {
    if (!supervisor) return [];
    return getApplications({ companyId: supervisor.company_id, status: 'approved' })
      .map((a) => getStudentById(a.student_id))
      .filter(Boolean);
  }, [supervisor]);

  const selectedStudent = studentId ? getStudentById(Number(studentId)) : null;
  const selectedUser = selectedStudent ? getUserById(selectedStudent.user_id) : null;

  const logs = useMemo(() => {
    if (!studentId) return [];
    let l = getDailyLogs({ studentId: Number(studentId) });
    if (dateFrom) l = l.filter((x) => x.log_date >= dateFrom);
    if (dateTo) l = l.filter((x) => x.log_date <= dateTo);
    return [...l].sort((a, b) => b.log_date.localeCompare(a.log_date));
  }, [studentId, dateFrom, dateTo]);

  const stats = useMemo(() => {
    let totalMins = 0;
    let approved = 0;
    let pending = 0;
    let rejected = 0;
    logs.forEach((l) => {
      totalMins += logMinutes(l);
      if (l.status === 'approved') approved++;
      else if (l.status === 'pending') pending++;
      else if (l.status === 'rejected') rejected++;
    });
    const totalHours = totalMins / 60;
    const avgHours = logs.length ? totalHours / logs.length : 0;
    const approvalRate = logs.length ? Math.round((approved / logs.length) * 100) : 0;
    return { totalMins, totalHours, avgHours, approved, pending, rejected, approvalRate };
  }, [logs]);

  const hoursChart: ChartPoint[] = useMemo(
    () =>
      [...logs]
        .sort((a, b) => a.log_date.localeCompare(b.log_date))
        .map((l) => ({
          name: formatDateLabel(l.log_date),
          value: Math.round((logMinutes(l) / 60) * 10) / 10,
        })),
    [logs]
  );

  const statusChart: ChartPoint[] = useMemo(() => {
    const pts: ChartPoint[] = [];
    if (stats.approved) pts.push({ name: 'Approved', value: stats.approved });
    if (stats.pending) pts.push({ name: 'Pending', value: stats.pending });
    if (stats.rejected) pts.push({ name: 'Rejected', value: stats.rejected });
    return pts;
  }, [stats]);

  const applyPreset = (preset: 'month' | '30d' | 'all') => {
    const today = new Date();
    const to = today.toISOString().split('T')[0];
    if (preset === 'all') {
      setDateFrom('');
      setDateTo('');
      return;
    }
    if (preset === '30d') {
      const from = new Date(today);
      from.setDate(from.getDate() - 30);
      setDateFrom(from.toISOString().split('T')[0]);
      setDateTo(to);
      return;
    }
    const from = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(to);
  };

  if (!supervisor) {
    return <p className="text-violet-300">Supervisor profile not found.</p>;
  }

  return (
    <>
      <PageHeader
        title="Attendance Report"
        subtitle="Track daily logs, hours, and approval status"
      />

      {/* Filters */}
      <Card className="mb-6" title="🔭 Mission Control">
        <div className="grid md:grid-cols-3 gap-4">
          <Select
            label="Student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            options={[
              { value: '', label: 'Select a star intern...' },
              ...students.map((s) => ({
                value: s!.id,
                label: `${getUserById(s!.user_id)?.full_name} (${s!.student_id})`,
              })),
            ]}
          />
          <div>
            <label className="block text-sm font-medium text-violet-300 mb-1">From</label>
            <input
              type="date"
              className="input-dark w-full"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-violet-300 mb-1">To</label>
            <input
              type="date"
              className="input-dark w-full"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-violet-500/20">
          <span className="text-xs text-violet-400/80 self-center mr-1">Quick range:</span>
          {(
            [
              ['all', 'All time', '🌌'],
              ['30d', 'Last 30 days', '📅'],
              ['month', 'This month', '🍬'],
            ] as const
          ).map(([key, label, icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => applyPreset(key)}
              className="rounded-xl border border-violet-500/30 bg-[#12102a] px-3 py-1.5 text-xs font-medium text-violet-200 hover:border-fuchsia-400/50 hover:bg-violet-500/10 hover:text-fuchsia-200 transition"
            >
              {icon} {label}
            </button>
          ))}
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => applyPreset('all')}
              className="rounded-xl border border-pink-500/30 px-3 py-1.5 text-xs text-pink-300 hover:bg-pink-500/10 transition"
            >
              Clear dates
            </button>
          )}
        </div>
      </Card>

      {/* Student picker when none selected */}
      {!studentId && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold font-display text-[#f5f3ff] mb-3 flex items-center gap-2">
            <span>✨</span> Choose an intern to explore
          </h2>
          {students.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-4xl mb-3">🛸</p>
                <p className="text-violet-300">No assigned students yet.</p>
                <p className="text-sm text-violet-400/70 mt-1">
                  Approved applications will appear here.
                </p>
              </div>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((s) => {
                const u = getUserById(s!.user_id);
                const studentLogs = getDailyLogs({ studentId: s!.id });
                const approvedLogs = studentLogs.filter((l) => l.status === 'approved');
                let mins = 0;
                approvedLogs.forEach((l) => {
                  mins += logMinutes(l);
                });
                const initials = studentInitials(u?.full_name);
                return (
                  <button
                    key={s!.id}
                    type="button"
                    onClick={() => setStudentId(String(s!.id))}
                    className="group text-left rounded-2xl border border-violet-500/30 bg-[#1a1535] p-5 transition-all hover:border-fuchsia-400/50 hover:shadow-[0_0_28px_rgba(168,85,247,0.25)] hover:scale-[1.02]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 via-[#7c3aed] to-[#e879f9] text-lg font-bold text-white shadow-[0_0_20px_rgba(103,232,249,0.25)]">
                        {initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#f5f3ff] truncate group-hover:text-fuchsia-200 transition">
                          {u?.full_name}
                        </p>
                        <p className="text-sm text-violet-400/80">{s!.student_id}</p>
                        <p className="text-xs text-cyan-300/90 mt-1">
                          {studentLogs.length} logs · {(mins / 60).toFixed(1)}h approved
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-fuchsia-300/80 mt-3 text-center">
                      Open attendance report →
                    </p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {studentId && selectedStudent && (
        <>
          {/* Student hero */}
          <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#1a1535] via-[#221b4a] to-[#12102a] p-6 mb-6 shadow-[0_0_32px_rgba(103,232,249,0.15)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_90%_10%,rgba(103,232,249,0.12),transparent_45%),radial-gradient(circle_at_5%_95%,rgba(232,121,249,0.12),transparent_45%)] pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 via-[#7c3aed] to-[#e879f9] text-xl font-bold text-white shadow-[0_0_24px_rgba(103,232,249,0.35)]">
                {studentInitials(selectedUser?.full_name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-widest text-cyan-300/90 font-medium">
                  Attendance for
                </p>
                <h2 className="text-2xl font-bold font-display text-[#f5f3ff] truncate">
                  {selectedUser?.full_name}
                </h2>
                <p className="text-sm text-violet-300/90">
                  {selectedStudent.student_id} · {selectedStudent.course}
                </p>
              </div>
              <div className="btn-row shrink-0">
                <Link
                  to={`/supervisor/students/${selectedStudent.id}/logs`}
                  className="quick-action-btn text-sm"
                >
                  All logs
                </Link>
                <button
                  type="button"
                  onClick={() => setStudentId('')}
                  className="rounded-xl border border-violet-500/30 px-3 py-2 text-sm text-violet-300 hover:text-fuchsia-200 hover:border-fuchsia-400/40 transition"
                >
                  Change
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard label="Total Days" value={logs.length} color="bg-cyan-600" />
            <StatCard
              label="Total Hours"
              value={stats.totalHours.toFixed(1)}
              color="purple"
            />
            <StatCard
              label="Avg / Day"
              value={stats.avgHours.toFixed(1) + 'h'}
              color="fuchsia"
            />
            <StatCard
              label="Approved"
              value={`${stats.approvalRate}%`}
              color="bg-green-600"
            />
          </div>

          {logs.length > 0 ? (
            <>
              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-4 mb-6">
                <ChartCard title="Hours per Day ⏱️">
                  <BarChartView
                    data={hoursChart}
                    color="#67e8f9"
                    height={260}
                    layout="vertical"
                  />
                </ChartCard>
                <ChartCard title="Log Status Mix 🍬">
                  <PieChartView data={statusChart} height={260} />
                </ChartCard>
              </div>

              {/* Table */}
              <Card title="Daily Log Timeline">
                <Table headers={['Date', 'In', 'Out', 'Hours', 'Status', '']}>
                  {logs.length === 0 ? (
                    <EmptyRow cols={6} message="No logs in this date range." />
                  ) : (
                    logs.map((l) => (
                      <tr
                        key={l.id}
                        className="border-b border-violet-500/15 hover:bg-violet-500/5 transition-colors"
                      >
                        <td className={tableCellMedium}>
                          <div className="flex items-center gap-2">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600/40 to-fuchsia-600/30 text-xs font-bold text-violet-200">
                              {formatWeekday(l.log_date).slice(0, 2)}
                            </span>
                            <div>
                              <p>{formatDateLabel(l.log_date)}</p>
                              <p className="text-xs text-violet-400/70 font-normal">
                                {l.log_date}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className={tableCell}>
                          <span className="inline-flex items-center gap-1">
                            <span className="text-emerald-400">▶</span>
                            {l.time_in}
                          </span>
                        </td>
                        <td className={tableCell}>
                          <span className="inline-flex items-center gap-1">
                            <span className="text-pink-400">◀</span>
                            {l.time_out}
                          </span>
                        </td>
                        <td className={tableCell}>
                          <span className="font-semibold text-cyan-200 tabular-nums">
                            {calcHours(l.time_in, l.time_out)}
                          </span>
                        </td>
                        <td className={tableCell}>
                          <StatusBadge status={l.status} />
                        </td>
                        <td className={tableCell}>
                          <Link
                            to={`/supervisor/logs/${l.id}`}
                            className="text-sm text-fuchsia-300 hover:text-fuchsia-200 font-medium"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </Table>
              </Card>

              {/* Summary footer */}
              <div className="mt-4 rounded-2xl border border-violet-500/25 bg-[#12102a]/80 px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-violet-300/90">
                  Showing <strong className="text-[#f5f3ff]">{logs.length}</strong> entries
                  {(dateFrom || dateTo) && (
                    <>
                      {' '}
                      · {dateFrom || '…'} → {dateTo || '…'}
                    </>
                  )}
                </span>
                <span className="text-fuchsia-200 font-medium">
                  🍬 {stats.totalHours.toFixed(1)} total hours logged
                </span>
              </div>
            </>
          ) : (
            <Card>
              <div className="text-center py-16">
                <p className="text-5xl mb-4 animate-float">🌠</p>
                <h3 className="text-xl font-semibold font-display text-[#f5f3ff] mb-2">
                  No logs in this range
                </h3>
                <p className="text-violet-400/80 text-sm max-w-md mx-auto">
                  Try widening your date filter or pick &quot;All time&quot; to see every
                  daily log for {selectedUser?.full_name?.split(' ')[0]}.
                </p>
                <button
                  type="button"
                  onClick={() => applyPreset('all')}
                  className="mt-6 quick-action-btn inline-block"
                >
                  Show all time
                </button>
              </div>
            </Card>
          )}
        </>
      )}
    </>
  );
}
