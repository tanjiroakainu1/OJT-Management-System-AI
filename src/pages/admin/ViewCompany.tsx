import { Link, useParams } from 'react-router-dom';
import { getApplications, getCompanyById, getSupervisorsByCompany } from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, PageHeader, StatusBadge } from '../../components/ui';

export default function ViewCompany() {
  const { id } = useParams();
  const version = useDbRefresh();
  const company = getCompanyById(Number(id));
  if (!company) return <p>Not found</p>;
  const apps = getApplications({ companyId: company.id });
  const supervisors = getSupervisorsByCompany(company.id);

  return (
    <>
      <PageHeader title={company.name} key={version} />
      <Card title="Details">
        <dl className="text-sm space-y-2">
          <div><dt className="dt-label">Address</dt><dd>{company.address}</dd></div>
          <div><dt className="dt-label">Contact</dt><dd>{company.contact_person} — {company.contact_number}</dd></div>
          <div><dt className="dt-label">Email</dt><dd>{company.email}</dd></div>
          <div><dt className="dt-label">Status</dt><dd><StatusBadge status={company.status} /></dd></div>
        </dl>
      </Card>
      <Card title={`Applications (${apps.length})`} className="mt-4">
        {apps.map((a) => (
          <div key={a.id} className="flex justify-between border-b py-2 text-sm">
            <span>{a.position}</span>
            <StatusBadge status={a.status} />
          </div>
        ))}
      </Card>
      <p className="text-sm mt-4">Supervisors: {supervisors.length}</p>
      <Link to={`/admin/companies/${company.id}/edit`} className="link-back mt-2 inline-block">Edit</Link>
      <Link to="/admin/companies" className="link-back mt-2 ml-4 inline-block">← Back</Link>
    </>
  );
}
