import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  deleteAnnouncement,
  getAnnouncementRecipientCount,
  getAnnouncementsWithCreator,
  getStudentCourses,
} from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Button, Card, EmptyRow, PageHeader, Table } from '../../components/ui';

export default function CoordinatorAnnouncements() {
  const version = useDbRefresh();
  const courses = useMemo(() => getStudentCourses(), [version]);

  const announcements = useMemo(() => getAnnouncementsWithCreator(), [version]);

  const handleDelete = (id: number, title: string) => {
    const count = getAnnouncementRecipientCount(id);
    const msg =
      count > 0
        ? `Delete "${title}"? ${count} student recipient(s) will be removed.`
        : `Delete announcement "${title}"?`;
    if (!confirm(msg)) return;
    const result = deleteAnnouncement(id);
    if (!result.ok) alert(result.error ?? 'Could not delete announcement.');
  };

  return (
    <>
      <PageHeader
        title="Announcements"
        subtitle="Create, edit, and manage announcements for students"
      />

      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <p className="text-sm text-body">
          {announcements.length} announcement{announcements.length !== 1 ? 's' : ''}
        </p>
        <Link to="/coordinator/announcements/new">
          <Button>Add Announcement</Button>
        </Link>
      </div>

      <Card>
        <Table
          headers={[
            'Title',
            'Message',
            'Target',
            'Posted By',
            'Email',
            'Date',
            'Recipients',
            'Actions',
          ]}
        >
          {announcements.length === 0 ? (
            <EmptyRow
              cols={8}
              message="No announcements yet. Click Add Announcement to publish one."
            />
          ) : (
            announcements.map((a) => (
              <tr key={a.id}>
                <td className="px-4 py-3 text-sm font-medium align-top">{a.title}</td>
                <td className="px-4 py-3 text-sm max-w-xs align-top">
                  <p className="line-clamp-2" title={a.message}>
                    {a.message}
                  </p>
                </td>
                <td className="px-4 py-3 text-sm align-top">
                  {a.target_course || (
                    <span className="text-muted">All courses</span>
                  )}
                </td>
                <td className="px-4 py-3 text-sm align-top">{a.creator_name}</td>
                <td className="px-4 py-3 text-sm align-top">{a.creator_email}</td>
                <td className="px-4 py-3 text-sm align-top whitespace-nowrap">
                  {new Date(a.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm align-top text-center">
                  {getAnnouncementRecipientCount(a.id)}
                </td>
                <td className="px-4 py-3 text-sm align-top space-x-2 whitespace-nowrap">
                  <Link
                    to={`/coordinator/announcements/${a.id}/edit`}
                    className="link-edit"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(a.id, a.title)}
                    className="link-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </Table>
      </Card>

      {courses.length > 0 && (
        <p className="text-xs text-muted mt-3">
          Available courses for targeting: {courses.join(', ')}
        </p>
      )}
    </>
  );
}
