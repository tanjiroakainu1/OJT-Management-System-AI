import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteUser, getStudentCourses, getStudents } from '../../lib/db';
import { getStudentsByCourseChart, getStudentsByYearChart } from '../../lib/chartData';
import { useDbRefresh } from '../../context/DataContext';
import { BarChartView, ChartCard } from '../../components/charts/Charts';
import { Button, Card, EmptyRow, Input, PageHeader, Table } from '../../components/ui';

export default function ManageStudents() {
  const version = useDbRefresh();
  const [search, setSearch] = useState('');
  const [course, setCourse] = useState('');

  const rows = useMemo(
    () => getStudents({ search: search || undefined, course: course || undefined }),
    [search, course, version]
  );

  const courses = useMemo(() => getStudentCourses(), [version]);
  const byCourse = useMemo(() => {
    const data = getStudentsByCourseChart();
    if (!course) return data;
    return data.filter((d) => d.name === course);
  }, [course, version]);
  const byYear = useMemo(() => getStudentsByYearChart(), [version]);

  const handleDelete = (userId: number) => {
    if (confirm('Delete this student and all related data?')) {
      deleteUser(userId);
    }
  };

  return (
    <>
      <PageHeader title="Manage Students" subtitle={`${rows.length} student(s)`} />
      <div className="flex gap-4 mb-4 flex-wrap">
        <Input
          label=""
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-0 max-w-xs"
        />
        <select
          className="input-dark h-10 self-end"
          value={course}
          onChange={(e) => setCourse(e.target.value)}
        >
          <option value="">All Courses</option>
          {courses.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <Link to="/admin/users/new?role=student" className="self-end">
          <Button>Add Student</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Students by Course">
          <BarChartView data={byCourse} color="#e879f9" />
        </ChartCard>
        <ChartCard title="Students by Year Level">
          <BarChartView data={byYear} color="#ff4500" />
        </ChartCard>
      </div>

      <Card>
        <Table headers={['Student ID', 'Name', 'Course', 'Year', 'Section', 'Actions']}>
          {rows.length === 0 ? (
            <EmptyRow cols={6} message="No students found." />
          ) : (
            rows.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 text-sm">{s.student_id}</td>
                <td className="px-4 py-3 text-sm">{s.user?.full_name}</td>
                <td className="px-4 py-3 text-sm">{s.course}</td>
                <td className="px-4 py-3 text-sm">{s.year}</td>
                <td className="px-4 py-3 text-sm">{s.section}</td>
                <td className="px-4 py-3 text-sm space-x-2">
                  <Link to={`/admin/students/${s.id}`} className="link-action">View</Link>
                  <Link to={`/admin/users/${s.user_id}/edit`} className="link-edit">Edit</Link>
                  <button type="button" onClick={() => handleDelete(s.user_id)} className="link-danger">Delete</button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </>
  );
}
