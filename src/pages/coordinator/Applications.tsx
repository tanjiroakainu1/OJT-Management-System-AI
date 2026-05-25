import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getApplications, getCompanyById, getStudentById, getUserById, updateApplicationStatus } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, EmptyRow, PageHeader, StatusBadge, Table } from '../../components/ui';
import type { Status } from '../../types';

export default function CoordinatorApplications() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const status = params.get('status') ?? '';
  const version = useDbRefresh();
  const apps = useMemo(
    () => getApplications(status ? { status: status as Status } : undefined),
    [status, version]
  );

  const handle = (id: number, s: Status) => {
    const r = prompt('Remarks:') ?? undefined;
    if (user) updateApplicationStatus(id, s, user.id, r);
  };

  return (
    <>
      <PageHeader title="Manage Applications" />
      <div className="btn-row mb-4">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <Link key={s} to={s ? `/coordinator/applications?status=${s}` : '/coordinator/applications'} className={`px-3 py-1 rounded text-sm ${status === s ? 'filter-pill-active' : 'filter-pill'}`}>{s || 'All'}</Link>
        ))}
      </div>
      <Card>
        <Table headers={['Student', 'Company', 'Position', 'Status', 'Actions']}>
          {apps.length === 0 ? <EmptyRow cols={5} message="No applications." /> : apps.map((a) => {
            const s = getStudentById(a.student_id);
            const u = s ? getUserById(s.user_id) : null;
            return (
              <tr key={a.id}>
                <td className="px-4 py-3 text-sm">{u?.full_name}</td>
                <td className="px-4 py-3 text-sm">{getCompanyById(a.company_id)?.name}</td>
                <td className="px-4 py-3 text-sm">{a.position}</td>
                <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                <td className="px-4 py-3 text-sm space-x-2">
                  <Link to={`/coordinator/applications/${a.id}`} className="link-action">View</Link>
                  {a.status === 'pending' && (
                    <>
                      <button type="button" onClick={() => handle(a.id, 'approved')} className="link-edit">Approve</button>
                      <button type="button" onClick={() => handle(a.id, 'rejected')} className="link-danger">Reject</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>
    </>
  );
}
