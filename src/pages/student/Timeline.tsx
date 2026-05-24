import { useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  getApplications,
  getDailyLogs,
  getFullState,
  getOjtRequirements,
  getStudentByUserId,
  getStudentRequirements,
  markNotificationsRead,
} from '../../lib/db';
import { useDbRefresh } from '../../context/DataContext';
import { Card, PageHeader, StatusBadge } from '../../components/ui';

export default function StudentTimeline() {
  const { user } = useAuth();
  const version = useDbRefresh();
  const student = user ? getStudentByUserId(user.id) : null;

  useEffect(() => {
    if (user) markNotificationsRead(user.id);
  }, [user, version]);

  const all = useMemo(() => {
    if (!student) return [];
    const events: { date: string; type: string; title: string; status?: string }[] = [];

    getApplications({ studentId: student.id }).forEach((a) => {
      events.push({ date: a.created_at, type: 'application', title: `OJT Application — ${a.position}`, status: a.status });
    });
    getDailyLogs({ studentId: student.id }).forEach((l) => {
      events.push({ date: l.submitted_at, type: 'log', title: `Daily Log — ${l.log_date}`, status: l.status });
    });
    getStudentRequirements({ studentId: student.id }).forEach((r) => {
      const req = getOjtRequirements().find((x) => x.id === r.requirement_id);
      events.push({ date: r.submitted_at, type: 'requirement', title: `Requirement — ${req?.name}`, status: r.status });
    });

    const appIds = getApplications({ studentId: student.id }).map((x) => x.id);
    const logIds = getDailyLogs({ studentId: student.id }).map((x) => x.id);
    const reqIds = getStudentRequirements({ studentId: student.id }).map((x) => x.id);

    const activities = getFullState().activities
      .filter((a) =>
        (a.entity === 'application' && appIds.includes(a.entity_id!)) ||
        (a.entity === 'log' && logIds.includes(a.entity_id!)) ||
        (a.entity === 'requirement' && reqIds.includes(a.entity_id!))
      )
      .map((a) => ({
        date: a.created_at,
        type: 'activity',
        title: `${a.action} — ${a.entity} #${a.entity_id}`,
        status: undefined,
      }));

    return [...events, ...activities].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [student, version]);

  return (
    <>
      <PageHeader title="Timeline" subtitle="Your OJT activity history" />
      <Card>
        {all.length === 0 ? (
          <p className="text-muted text-sm">No activity yet.</p>
        ) : (
          <ul className="space-y-4">
            {all.map((e, i) => (
              <li key={i} className="flex gap-4 border-l-2 border-blue-200 pl-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">{e.title}</p>
                  <p className="text-xs text-zinc-500">{new Date(e.date).toLocaleString()}</p>
                </div>
                {e.status && <StatusBadge status={e.status} />}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
}
