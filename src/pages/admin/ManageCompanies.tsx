import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { deleteCompany, getCompanies, updateCompany } from '../../lib/db';
import { getCompaniesByStatusChart, getCompanyPlacementsChart } from '../../lib/chartData';
import { useDbRefresh } from '../../context/DataContext';
import { BarChartView, ChartCard, PieChartView } from '../../components/charts/Charts';
import { Button, Card, EmptyRow, PageHeader, StatusBadge, Table } from '../../components/ui';

export default function ManageCompanies() {
  const version = useDbRefresh();
  const companies = useMemo(() => getCompanies(), [version]);
  const statusChart = useMemo(() => getCompaniesByStatusChart(), [version]);
  const placementsChart = useMemo(() => getCompanyPlacementsChart(), [version]);

  const toggleStatus = (id: number, current: string) => {
    updateCompany(id, { status: current === 'active' ? 'inactive' : 'active' });
  };

  const handleDelete = (id: number) => {
    if (!deleteCompany(id)) {
      alert('Cannot delete company with existing applications.');
    }
  };

  return (
    <>
      <PageHeader title="Manage Companies" subtitle={`${companies.length} registered`} />
      <Link to="/admin/companies/new" className="inline-block mb-4">
        <Button>Add Company</Button>
      </Link>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <ChartCard title="Companies by Status">
          <PieChartView data={statusChart} />
        </ChartCard>
        <ChartCard title="Top Placements by Company">
          <BarChartView data={placementsChart} layout="horizontal" color="#ff4500" height={300} />
        </ChartCard>
      </div>

      <Card>
        <Table headers={['Name', 'Contact', 'Email', 'Status', 'Actions']}>
          {companies.length === 0 ? (
            <EmptyRow cols={5} message="No companies found." />
          ) : (
            companies.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-3 text-sm font-medium">{c.name}</td>
                <td className="px-4 py-3 text-sm">{c.contact_person}</td>
                <td className="px-4 py-3 text-sm">{c.email}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-sm space-x-2">
                  <Link to={`/admin/companies/${c.id}`} className="link-action">View</Link>
                  <Link to={`/admin/companies/${c.id}/edit`} className="link-edit">Edit</Link>
                  <button type="button" onClick={() => toggleStatus(c.id, c.status)} className="link-edit">Toggle</button>
                  <button type="button" onClick={() => handleDelete(c.id)} className="link-danger">Delete</button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>
    </>
  );
}
