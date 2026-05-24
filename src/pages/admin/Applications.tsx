import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getApplications,
  getCompanyById,
  getStudentById,
  getUserById,
  updateApplicationStatus,
} from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, EmptyRow, PageHeader, StatusBadge, Table } from '../../components/ui';
import type { Status } from '../../types';

export default function AdminApplications() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const statusParam = params.get('status') ?? '';
  const version = useDbRefresh();

  const apps = useMemo(() => {
    const filter = statusParam as Status | 'active' | 'completed' | '';
    return getApplications(filter ? { status: filter } : undefined);
  }, [statusParam, version]);

  const handleAction = (id: number, status: Status) => {
    const remarks = prompt('Remarks (optional):') ?? undefined;
    if (user) updateApplicationStatus(id, status, user.id, remarks);
  };

  return (
    <>
      <PageHeader title="OJT Applications" />
      <div className="flex gap-2 mb-4 flex-wrap text-sm">
        {['', 'pending', 'approved', 'rejected', 'active', 'completed'].map((s) => (
          <Link
            key={s}
            to={s ? `/admin/applications?status=${s}` : '/admin/applications'}
            className={`px-3 py-1 rounded ${statusParam === s ? 'filter-pill-active' : 'filter-pill'}`}
          >
            {s || 'All'}
          </Link>
        ))}
      </div>
      <Card>
        <Table headers={['Student', 'Company', 'Position', 'Dates', 'Status', 'Actions']}>
          {apps.length === 0 ? (
            <EmptyRow cols={6} message="No applications found." />
          ) : (
            apps.map((a) => {
              const student = getStudentById(a.student_id);
              const u = student ? getUserById(student.user_id) : null;
              const company = getCompanyById(a.company_id);
              return (
                <tr key={a.id}>
                  <td className="px-4 py-3 text-sm">{u?.full_name} ({student?.student_id})</td>
                  <td className="px-4 py-3 text-sm">{company?.name}</td>
                  <td className="px-4 py-3 text-sm">{a.position}</td>
                  <td className="px-4 py-3 text-sm text-xs">{a.start_date} – {a.end_date}</td>
                  <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                  <td className="px-4 py-3 text-sm space-x-2">
                    <Link to={`/admin/applications/${a.id}`} className="link-action">View</Link>
                    {a.status === 'pending' && (
                      <>
                        <button type="button" onClick={() => handleAction(a.id, 'approved')} className="link-edit">Approve</button>
                        <button type="button" onClick={() => handleAction(a.id, 'rejected')} className="link-danger">Reject</button>
                      </>
                    )}
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
