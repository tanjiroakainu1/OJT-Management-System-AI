import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudents } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, EmptyRow, PageHeader, Table } from '../../components/ui';

export default function CoordinatorManageStudents() {
  const version = useDbRefresh();
  const [search, setSearch] = useState('');
  const rows = useMemo(
    () => getStudents({ search: search || undefined }),
    [search, version]
  );

  return (
    <>
      <PageHeader title="Manage Students" />
      <input
        className="border rounded-lg px-3 py-2 mb-4 max-w-xs"
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Card>
        <Table headers={['ID', 'Name', 'Email', 'Course', 'Year', 'Actions']}>
          {rows.length === 0 ? <EmptyRow cols={6} message="No students." /> : rows.map((s) => (
            <tr key={s.id}>
              <td className="px-4 py-3 text-sm">{s.student_id}</td>
              <td className="px-4 py-3 text-sm">{s.user?.full_name}</td>
              <td className="px-4 py-3 text-sm">{s.user?.email}</td>
              <td className="px-4 py-3 text-sm">{s.course}</td>
              <td className="px-4 py-3 text-sm">{s.year}</td>
              <td className="px-4 py-3 text-sm">
                <Link to={`/coordinator/students/${s.id}`} className="link-action">View</Link>
                {' · '}
                <Link to={`/coordinator/students/${s.id}/edit`} className="link-edit">Edit</Link>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
