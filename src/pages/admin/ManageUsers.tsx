import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { deleteUser, getUsers } from '../../lib/db';
import { getUsersByRoleChart } from '../../lib/chartData';
import { useDbRefresh } from '../../context/DataContext';
import { ChartCard, PieChartView } from '../../components/charts/Charts';
import { Button, Card, EmptyRow, PageHeader, RoleBadge, Table } from '../../components/ui';
import type { UserRole } from '../../types';

export default function ManageUsers() {
  const [params] = useSearchParams();
  const roleFilter = (params.get('role') as UserRole) || '';
  const version = useDbRefresh();

  const users = useMemo(
    () => getUsers({ role: roleFilter || undefined }),
    [roleFilter, version]
  );

  const roleChart = useMemo(() => {
    const all = getUsersByRoleChart();
    if (!roleFilter) return all;
    const label = roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1);
    return all.filter((d) => d.name.toLowerCase() === label.toLowerCase());
  }, [roleFilter, version]);

  const handleDelete = (id: number) => {
    if (confirm('Delete this user?')) {
      deleteUser(id);
    }
  };

  return (
    <>
      <PageHeader title="Manage Users" subtitle={roleFilter ? `Role: ${roleFilter}` : 'All users'} />
      <div className="btn-row mb-4">
        <Link to="/admin/users"><Button variant="secondary">All</Button></Link>
        <Link to="/admin/users?role=admin"><Button variant="secondary">Admin</Button></Link>
        <Link to="/admin/users?role=coordinator"><Button variant="secondary">Coordinator</Button></Link>
        <Link to="/admin/users?role=supervisor"><Button variant="secondary">Supervisor</Button></Link>
        <Link to="/admin/users/new" className="w-full xs:w-auto xs:ml-auto shrink-0">
          <Button className="w-full xs:w-auto">Add User</Button>
        </Link>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Users by Role">
          <PieChartView data={roleChart} />
        </ChartCard>
        <ChartCard title="Listed Users (current filter)">
          <PieChartView
            data={[
              { name: 'Shown in table', value: users.length },
              {
                name: 'Other roles',
                value: Math.max(0, getUsers().length - users.length),
              },
            ]}
          />
        </ChartCard>
      </div>

      <Card>
        <Table headers={['Email', 'Name', 'Role', 'Actions']}>
          {users.length === 0 ? (
            <EmptyRow cols={4} message="No users found." />
          ) : (
            users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-3 text-sm">{u.email}</td>
                <td className="px-4 py-3 text-sm">{u.full_name}</td>
                <td className="px-4 py-3"><RoleBadge role={u.role} /></td>
                <td className="px-4 py-3 text-sm space-x-2">
                  <Link to={`/admin/users/${u.id}`} className="link-action">View</Link>
                  <Link to={`/admin/users/${u.id}/edit`} className="link-edit">Edit</Link>
                  {u.role !== 'admin' && (
                    <button type="button" onClick={() => handleDelete(u.id)} className="link-danger">Delete</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </>
  );
}
