import { FormEvent, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getApplications,
  getEvaluations,
  getStudentById,
  getSupervisorByUserId,
  getUserById,
  upsertEvaluation,
} from '../../lib/db';
import { RatingSlider, ScoreRing } from '../../components/RatingSlider';
import { Alert, Button, Card, PageHeader } from '../../components/ui';

const CRITERIA = [
  {
    key: 'punctuality' as const,
    label: 'Punctuality',
    icon: '⏰',
    hint: 'On-time & reliable',
    accent: 'from-violet-600 to-purple-500',
  },
  {
    key: 'work_quality' as const,
    label: 'Work Quality',
    icon: '✨',
    hint: 'Accuracy & effort',
    accent: 'from-fuchsia-600 to-pink-500',
  },
  {
    key: 'initiative' as const,
    label: 'Initiative',
    icon: '🚀',
    hint: 'Self-driven action',
    accent: 'from-indigo-600 to-violet-500',
  },
  {
    key: 'communication' as const,
    label: 'Communication',
    icon: '💬',
    hint: 'Clear & professional',
    accent: 'from-cyan-600 to-blue-500',
  },
  {
    key: 'teamwork' as const,
    label: 'Teamwork',
    icon: '🤝',
    hint: 'Collaboration',
    accent: 'from-purple-600 to-fuchsia-500',
  },
];

type RatingKey = (typeof CRITERIA)[number]['key'];

export default function EvaluateStudent() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const supervisor = user ? getSupervisorByUserId(user.id) : null;
  const student = studentId ? getStudentById(Number(studentId)) : null;

  const existing =
    student && supervisor
      ? getEvaluations({ studentId: student.id, supervisorId: supervisor.id })[0]
      : undefined;

  const [form, setForm] = useState({
    evaluation_date: existing?.evaluation_date ?? new Date().toISOString().split('T')[0],
    punctuality: existing?.punctuality ?? 3,
    work_quality: existing?.work_quality ?? 3,
    initiative: existing?.initiative ?? 3,
    communication: existing?.communication ?? 3,
    teamwork: existing?.teamwork ?? 3,
    comments: existing?.comments ?? '',
  });
  const [msg, setMsg] = useState('');

  const averageScore = useMemo(() => {
    return (
      (form.punctuality +
        form.work_quality +
        form.initiative +
        form.communication +
        form.teamwork) /
      5
    );
  }, [form]);

  if (!supervisor) return <p className="text-violet-300">Supervisor not found.</p>;

  const assignedStudents = getApplications({
    companyId: supervisor.company_id,
    status: 'approved',
  })
    .map((a) => getStudentById(a.student_id))
    .filter(Boolean);

  if (!studentId) {
    return (
      <>
        <PageHeader
          title="Evaluate Student"
          subtitle="Select an intern to evaluate"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {assignedStudents.length === 0 ? (
            <Card className="sm:col-span-2 lg:col-span-3">
              <p className="text-muted text-sm">No assigned students to evaluate yet.</p>
            </Card>
          ) : (
            assignedStudents.map((s) => {
              const u = getUserById(s!.user_id);
              const initials = (u?.full_name ?? '?')
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              return (
                <Link
                  key={s!.id}
                  to={`/supervisor/evaluate/${s!.id}`}
                  className="group block rounded-2xl border border-violet-500/30 bg-[#1a1535] p-5 transition-all hover:border-fuchsia-400/50 hover:shadow-[0_0_28px_rgba(168,85,247,0.25)] hover:scale-[1.02]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#e879f9] to-[#f472b6] text-lg font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#f5f3ff] truncate group-hover:text-fuchsia-200 transition">
                        {u?.full_name}
                      </p>
                      <p className="text-sm text-violet-400/80">{s!.student_id}</p>
                      <p className="text-xs text-fuchsia-300/80 mt-1">Tap to evaluate →</p>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </>
    );
  }

  if (!student) return <p className="text-violet-300">Student not found.</p>;
  const studentUser = getUserById(student.user_id);
  const initials = (studentUser?.full_name ?? '?')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    upsertEvaluation({
      student_id: student.id,
      supervisor_id: supervisor.id,
      evaluation_date: form.evaluation_date,
      punctuality: form.punctuality,
      work_quality: form.work_quality,
      initiative: form.initiative,
      communication: form.communication,
      teamwork: form.teamwork,
      comments: form.comments || null,
    });
    setMsg('Evaluation saved successfully.');
    setTimeout(() => navigate('/supervisor/evaluations'), 1200);
  };

  const setRating = (key: RatingKey, value: number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      <PageHeader
        title="Evaluate Student"
        subtitle="Rate performance across all criteria"
      />

      {msg && <Alert type="success">{msg}</Alert>}

      {/* Student hero */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/30 bg-gradient-to-br from-[#1a1535] via-[#221b4a] to-[#12102a] p-6 mb-6 shadow-[0_0_32px_rgba(168,85,247,0.2)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(232,121,249,0.15),transparent_40%),radial-gradient(circle_at_10%_90%,rgba(103,232,249,0.1),transparent_40%)] pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7c3aed] via-[#e879f9] to-[#f472b6] text-xl font-bold text-white shadow-[0_0_24px_rgba(168,85,247,0.4)] animate-pulseGlow">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-fuchsia-300/90 font-medium">
                Evaluating
              </p>
              <h2 className="text-2xl font-bold font-display text-[#f5f3ff] truncate">
                {studentUser?.full_name}
              </h2>
              <p className="text-sm text-violet-300/90">
                {student.student_id} · {student.course} · Year {student.year}
              </p>
            </div>
          </div>
          <ScoreRing score={averageScore} />
        </div>
        {existing && (
          <p className="relative mt-4 text-xs text-violet-400/80 border-t border-violet-500/20 pt-3">
            ✏️ Updating previous evaluation from{' '}
            {new Date(existing.created_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Ratings grid */}
          <div className="lg:col-span-2 space-y-4">
            <Card title="Performance Ratings 🍬">
              <div className="grid sm:grid-cols-2 gap-4">
                {CRITERIA.map((c) => (
                  <RatingSlider
                    key={c.key}
                    label={c.label}
                    icon={c.icon}
                    hint={c.hint}
                    value={form[c.key]}
                    onChange={(v) => setRating(c.key, v)}
                    accent={c.accent}
                  />
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar: date + comments + actions */}
          <div className="space-y-4">
            <Card title="Evaluation Details">
              <div className="mb-4">
                <label className="block text-sm font-medium text-violet-300 mb-1">
                  Evaluation Date
                </label>
                <input
                  type="date"
                  value={form.evaluation_date}
                  onChange={(e) =>
                    setForm({ ...form, evaluation_date: e.target.value })
                  }
                  className="input-dark"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-violet-300 mb-1">
                  Supervisor Comments
                </label>
                <textarea
                  value={form.comments}
                  onChange={(e) => setForm({ ...form, comments: e.target.value })}
                  rows={6}
                  placeholder="Share strengths, growth areas, and sweet notes for the student..."
                  className="input-dark resize-none"
                />
              </div>
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-violet-200 mb-3">Score breakdown</h3>
              <ul className="space-y-2">
                {CRITERIA.map((c) => (
                  <li
                    key={c.key}
                    className="flex items-center justify-between text-sm rounded-lg bg-[#12102a]/60 px-3 py-2"
                  >
                    <span className="text-violet-300/90">
                      {c.icon} {c.label}
                    </span>
                    <span className="font-semibold text-[#f5f3ff] tabular-nums">
                      {form[c.key]}/5
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between text-sm rounded-xl bg-gradient-to-r from-[#7c3aed]/30 to-[#e879f9]/20 px-3 py-2 border border-violet-500/30 font-medium">
                  <span className="text-fuchsia-200">Average</span>
                  <span className="text-[#f5f3ff] tabular-nums">{averageScore.toFixed(1)}/5</span>
                </li>
              </ul>
            </Card>

            <div className="flex flex-col gap-2">
              <Button type="submit" className="w-full">
                {existing ? '✨ Update Evaluation' : '🍬 Submit Evaluation'}
              </Button>
              <Link to="/supervisor/evaluations" className="quick-action-btn text-center">
                View All Evaluations
              </Link>
              <Link
                to="/supervisor/students"
                className="block text-center text-sm text-violet-400 hover:text-fuchsia-300 py-2 transition"
              >
                ← Back to students
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
