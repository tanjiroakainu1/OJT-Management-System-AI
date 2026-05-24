import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getApplications, getFullState } from '../../lib/db';
import {
  getCompanyPlacementsChart,
  getStudentHoursChart,
  getStudentsByCourseChart,
} from '../../lib/chartData';
import { useDbRefresh } from '../../context/DataContext';
import {
  BarChartView,
  ChartCard,
  MultiBarChartView,
  PieChartView,
} from '../../components/charts/Charts';
import { Card, PageHeader, Select } from '../../components/ui';

export default function AdminReports() {
  const version = useDbRefresh();
  const location = useLocation();
  const isCoordinator = location.pathname.startsWith('/coordinator');
  const [type, setType] = useState('student_hours');
  const [course, setCourse] = useState('');

  const { courses, reportData } = useMemo(() => {
    const state = getFullState();
    const courseList = [...new Set(state.students.map((s) => s.course))];
    const students = state.students.filter((s) => !course || s.course === course);

    if (type === 'student_hours') {
      return {
        courses: courseList,
        reportData: students.map((s) => {
          const u = state.users.find((x) => x.id === s.user_id);
          const logs = state.daily_logs.filter((l) => l.student_id === s.id && l.status === 'approved');
          let totalMins = 0;
          logs.forEach((l) => {
            const [inH, inM] = l.time_in.split(':').map(Number);
            const [outH, outM] = l.time_out.split(':').map(Number);
            totalMins += outH * 60 + outM - (inH * 60 + inM);
          });
          return {
            name: u?.full_name ?? '',
            student_id: s.student_id,
            course: s.course,
            days: logs.length,
            hours: (totalMins / 60).toFixed(1),
          };
        }),
      };
    }
    if (type === 'company_placements') {
      return {
        courses: courseList,
        reportData: state.companies.map((c) => ({
          name: c.name,
          active: getApplications({ companyId: c.id, status: 'active' }).length,
          total: getApplications({ companyId: c.id }).length,
        })),
      };
    }
    if (type === 'course_summary') {
      const grouped: Record<string, number> = {};
      students.forEach((s) => {
        grouped[s.course] = (grouped[s.course] ?? 0) + 1;
      });
      return {
        courses: courseList,
        reportData: Object.entries(grouped).map(([c, count]) => ({ course: c, count })),
      };
    }
    return {
      courses: courseList,
      reportData: state.activities.slice(0, 50).map((a) => {
        const u = state.users.find((x) => x.id === a.user_id);
        return { user: u?.email, action: a.action, entity: a.entity, date: a.created_at };
      }),
    };
  }, [type, course, version]);

  const chartData = useMemo(() => {
    if (type === 'student_hours') {
      return getStudentHoursChart(course || undefined);
    }
    if (type === 'company_placements') {
      return getCompanyPlacementsChart();
    }
    if (type === 'course_summary') {
      const all = getStudentsByCourseChart();
      if (!course) return all;
      return all.filter((d) => d.name === course);
    }
    const state = getFullState();
    const grouped: Record<string, number> = {};
    state.activities.slice(0, 50).forEach((a) => {
      grouped[a.action] = (grouped[a.action] ?? 0) + 1;
    });
    return Object.entries(grouped).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));
  }, [type, course, version]);

  const courseChartData = useMemo(
    () =>
      (reportData as { course: string; count: number }[]).map((r) => ({
        name: r.course,
        value: r.count,
      })),
    [reportData, type]
  );

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle={isCoordinator ? 'Coordinator analytics and export views' : 'System-wide analytics'}
      />
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Select
          label="Report Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={[
            { value: 'student_hours', label: 'Student Hours' },
            { value: 'company_placements', label: 'Company Placements' },
            { value: 'course_summary', label: 'Course Summary' },
            { value: 'activity_log', label: 'Activity Log' },
          ]}
        />
        <Select
          label="Course Filter"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          options={[{ value: '', label: 'All Courses' }, ...courses.map((c) => ({ value: c, label: c }))]}
        />
      </div>

      <div className="mb-6">
        {type === 'student_hours' && (
          <ChartCard title="Top Student Hours (approved logs)">
            <BarChartView data={chartData} layout="horizontal" color="#e879f9" height={300} />
          </ChartCard>
        )}
        {type === 'company_placements' && (
          <ChartCard title="Placements by Company">
            <MultiBarChartView
              data={chartData}
              keys={[
                { key: 'value', label: 'Total', color: '#e879f9' },
                { key: 'active', label: 'Active', color: '#ff4500' },
              ]}
            />
          </ChartCard>
        )}
        {type === 'course_summary' && (
          <ChartCard title="Students per Course">
            <BarChartView data={courseChartData} color="#7c3aed" height={280} />
          </ChartCard>
        )}
        {type === 'activity_log' && (
          <ChartCard title="Activity by Action Type">
            <PieChartView data={chartData} />
          </ChartCard>
        )}
      </div>

      <Card title="Report Data">
        {type === 'student_hours' && (
          <table className="data-table min-w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Student</th><th>ID</th><th>Course</th><th>Days</th><th>Hours</th></tr></thead>
            <tbody>
              {(reportData as { name: string; student_id: string; course: string; days: number; hours: string }[]).map((r, i) => (
                <tr key={i} className="border-b"><td className="py-2">{r.name}</td><td>{r.student_id}</td><td>{r.course}</td><td>{r.days}</td><td>{r.hours}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {type === 'company_placements' && (
          <table className="data-table min-w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Company</th><th>Active</th><th>Total</th></tr></thead>
            <tbody>
              {(reportData as { name: string; active: number; total: number }[]).map((r, i) => (
                <tr key={i} className="border-b"><td className="py-2">{r.name}</td><td>{r.active}</td><td>{r.total}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {type === 'course_summary' && (
          <table className="data-table min-w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2">Course</th><th>Students</th></tr></thead>
            <tbody>
              {(reportData as { course: string; count: number }[]).map((r, i) => (
                <tr key={i} className="border-b"><td className="py-2">{r.course}</td><td>{r.count}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {type === 'activity_log' && (
          <table className="data-table min-w-full text-sm">
            <thead><tr className="border-b"><th>Email</th><th>Action</th><th>Entity</th><th>Date</th></tr></thead>
            <tbody>
              {(reportData as { user?: string; action: string; entity: string; date: string }[]).map((r, i) => (
                <tr key={i} className="border-b"><td className="py-2">{r.user}</td><td>{r.action}</td><td>{r.entity}</td><td>{new Date(r.date).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
