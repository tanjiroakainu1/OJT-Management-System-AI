import { getApplications, getDailyLogs, getFullState } from './db';

export const CHART_COLORS = [
  '#a855f7',
  '#e879f9',
  '#f472b6',
  '#8b5cf6',
  '#67e8f9',
  '#c026d3',
  '#7c3aed',
  '#a78bfa',
];

export interface ChartPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getUsersByRoleChart(): ChartPoint[] {
  const state = getFullState();
  return (['admin', 'coordinator', 'supervisor', 'student'] as const).map((role) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: state.users.filter((u) => u.role === role).length,
  }));
}

export function getOjtLifecycleChart(): ChartPoint[] {
  const state = getFullState();
  const t = today();
  return [
    {
      name: 'Pending',
      value: state.ojt_applications.filter((a) => a.status === 'pending').length,
    },
    {
      name: 'Active OJT',
      value: state.ojt_applications.filter(
        (a) => a.status === 'approved' && a.end_date >= t
      ).length,
    },
    {
      name: 'Completed',
      value: state.ojt_applications.filter(
        (a) => a.status === 'approved' && a.end_date < t
      ).length,
    },
    {
      name: 'Rejected',
      value: state.ojt_applications.filter((a) => a.status === 'rejected').length,
    },
  ];
}

export function getApplicationsStatusChart(): ChartPoint[] {
  const state = getFullState();
  return (['pending', 'approved', 'rejected'] as const).map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: state.ojt_applications.filter((a) => a.status === status).length,
  }));
}

export function getStudentsByCourseChart(): ChartPoint[] {
  const state = getFullState();
  const grouped: Record<string, number> = {};
  state.students.forEach((s) => {
    grouped[s.course] = (grouped[s.course] ?? 0) + 1;
  });
  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function getStudentsByYearChart(): ChartPoint[] {
  const state = getFullState();
  const grouped: Record<string, number> = {};
  state.students.forEach((s) => {
    const key = `Year ${s.year}`;
    grouped[key] = (grouped[key] ?? 0) + 1;
  });
  return Object.entries(grouped)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getCompaniesByStatusChart(): ChartPoint[] {
  const state = getFullState();
  return [
    { name: 'Active', value: state.companies.filter((c) => c.status === 'active').length },
    { name: 'Inactive', value: state.companies.filter((c) => c.status === 'inactive').length },
  ];
}

export function getCompanyPlacementsChart(): ChartPoint[] {
  const state = getFullState();
  return state.companies
    .map((c) => ({
      name: c.name.length > 18 ? `${c.name.slice(0, 16)}…` : c.name,
      value: getApplications({ companyId: c.id }).length,
      active: getApplications({ companyId: c.id, status: 'active' }).length,
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

export function getStudentHoursChart(courseFilter?: string): ChartPoint[] {
  const state = getFullState();
  const students = state.students.filter((s) => !courseFilter || s.course === courseFilter);
  return students
    .map((s) => {
      const u = state.users.find((x) => x.id === s.user_id);
      const logs = state.daily_logs.filter((l) => l.student_id === s.id && l.status === 'approved');
      let totalMins = 0;
      logs.forEach((l) => {
        const [inH, inM] = l.time_in.split(':').map(Number);
        const [outH, outM] = l.time_out.split(':').map(Number);
        totalMins += outH * 60 + outM - (inH * 60 + inM);
      });
      const name = u?.full_name ?? s.student_id;
      return {
        name: name.length > 14 ? `${name.slice(0, 12)}…` : name,
        value: Math.round((totalMins / 60) * 10) / 10,
      };
    })
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);
}

export function getRequirementsStatusChart(): ChartPoint[] {
  const state = getFullState();
  return (['pending', 'approved', 'rejected'] as const).map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: state.student_requirements.filter((r) => r.status === status).length,
  }));
}

export function getDailyLogsStatusChart(): ChartPoint[] {
  const state = getFullState();
  return (['pending', 'approved', 'rejected'] as const).map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: state.daily_logs.filter((l) => l.status === status).length,
  }));
}

export function hasChartData(data: ChartPoint[]): boolean {
  return data.some((d) => d.value > 0);
}

function assignedStudentIds(companyId: number): number[] {
  const state = getFullState();
  const t = today();
  return [
    ...new Set(
      state.ojt_applications
        .filter(
          (a) =>
            a.company_id === companyId &&
            a.status === 'approved' &&
            a.start_date <= t &&
            a.end_date >= t
        )
        .map((a) => a.student_id)
    ),
  ];
}

export function getSupervisorLogsStatusChart(companyId: number): ChartPoint[] {
  const logs = getDailyLogs({ companyId });
  return (['pending', 'approved', 'rejected'] as const).map((status) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: logs.filter((l) => l.status === status).length,
  }));
}

export function getSupervisorStudentHoursChart(companyId: number): ChartPoint[] {
  const state = getFullState();
  const studentIds = assignedStudentIds(companyId);
  return studentIds
    .map((sid) => {
      const s = state.students.find((x) => x.id === sid);
      const u = s ? state.users.find((x) => x.id === s.user_id) : undefined;
      const logs = state.daily_logs.filter(
        (l) => l.student_id === sid && l.status === 'approved'
      );
      let totalMins = 0;
      logs.forEach((l) => {
        const [inH, inM] = l.time_in.split(':').map(Number);
        const [outH, outM] = l.time_out.split(':').map(Number);
        totalMins += outH * 60 + outM - (inH * 60 + inM);
      });
      const name = u?.full_name ?? s?.student_id ?? 'Student';
      return {
        name: name.length > 14 ? `${name.slice(0, 12)}…` : name,
        value: Math.round((totalMins / 60) * 10) / 10,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function getSupervisorPendingByStudentChart(companyId: number): ChartPoint[] {
  const state = getFullState();
  const pending = getDailyLogs({ companyId, status: 'pending' });
  const grouped: Record<number, number> = {};
  pending.forEach((l) => {
    grouped[l.student_id] = (grouped[l.student_id] ?? 0) + 1;
  });
  return Object.entries(grouped)
    .map(([sid, value]) => {
      const s = state.students.find((x) => x.id === Number(sid));
      const u = s ? state.users.find((x) => x.id === s.user_id) : undefined;
      const name = u?.full_name ?? s?.student_id ?? 'Student';
      return {
        name: name.length > 14 ? `${name.slice(0, 12)}…` : name,
        value,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function getSupervisorEvaluationsChart(supervisorId: number): ChartPoint[] {
  const state = getFullState();
  const evals = state.evaluations.filter((e) => e.supervisor_id === supervisorId);
  const grouped: Record<number, { count: number; total: number }> = {};
  evals.forEach((e) => {
    if (!grouped[e.student_id]) grouped[e.student_id] = { count: 0, total: 0 };
    grouped[e.student_id].count += 1;
    grouped[e.student_id].total += e.total_score;
  });
  return Object.entries(grouped)
    .map(([sid, { count, total }]) => {
      const s = state.students.find((x) => x.id === Number(sid));
      const u = s ? state.users.find((x) => x.id === s.user_id) : undefined;
      const name = u?.full_name ?? s?.student_id ?? 'Student';
      return {
        name: name.length > 14 ? `${name.slice(0, 12)}…` : name,
        value: Math.round((total / count) * 10) / 10,
        count,
      };
    })
    .sort((a, b) => b.value - a.value);
}
