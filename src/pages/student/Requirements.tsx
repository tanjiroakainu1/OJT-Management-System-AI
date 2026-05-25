import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  deleteStudentRequirementSubmission,
  getOjtRequirements,
  getStudentByUserId,
  getStudentRequirements,
  submitRequirement,
  updateStudentRequirementSubmission,
} from '../../lib/db';
import {
  MAX_REQUIREMENT_FILE_BYTES,
  REQUIREMENT_ACCEPT,
  readRequirementFile,
} from '../../lib/fileUpload';
import { useDbRefresh } from '../../context/DataContext';
import { RequirementFileLink, RequirementFilePreview } from '../../components/RequirementFile';
import {
  Alert,
  Button,
  Card,
  EmptyRow,
  PageHeader,
  StatusBadge,
  Table,
  tableCell,
  tableCellMedium,
} from '../../components/ui';

type FormMode = 'add' | 'edit' | null;

export default function StudentRequirements() {
  const { user } = useAuth();
  const version = useDbRefresh();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const student = user ? getStudentByUserId(user.id) : null;
  const templates = useMemo(() => getOjtRequirements(), [version]);
  const submissions = useMemo(
    () => (student ? getStudentRequirements({ studentId: student.id }) : []),
    [student, version]
  );

  const [formMode, setFormMode] = useState<FormMode>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [requirementId, setRequirementId] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [viewId, setViewId] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const editingSub = editingId ? submissions.find((s) => s.id === editingId) : null;
  const viewingSub = viewId ? submissions.find((s) => s.id === viewId) : null;

  const clearFile = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setFormMode(null);
    setEditingId(null);
    setRequirementId('');
    clearFile();
  };

  const openAdd = () => {
    setMsg('');
    setError('');
    setViewId(null);
    setFormMode('add');
    setEditingId(null);
    setRequirementId('');
    clearFile();
  };

  const openEdit = (submissionId: number) => {
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;
    if (sub.status === 'approved') {
      setError('Approved submissions cannot be edited.');
      return;
    }
    setMsg('');
    setError('');
    setViewId(null);
    setFormMode('edit');
    setEditingId(submissionId);
    setRequirementId(String(sub.requirement_id));
    clearFile();
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) {
      clearFile();
      return;
    }
    if (file.size > MAX_REQUIREMENT_FILE_BYTES) {
      setError('File must be 2 MB or smaller.');
      clearFile();
      return;
    }
    const type = file.type.toLowerCase();
    const ok = type === 'application/pdf' || type.startsWith('image/');
    if (!ok) {
      setError('Only PDF or image files (JPG, PNG, GIF, WebP) are allowed.');
      clearFile();
      return;
    }
    setSelectedFile(file);
    if (type.startsWith('image/')) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMsg('');
    setError('');
    if (!student) return;

    if (formMode === 'add') {
      if (!requirementId || !selectedFile) {
        setError('Select a requirement and choose a PDF or photo file.');
        return;
      }
      const exists = submissions.find((s) => s.requirement_id === Number(requirementId));
      if (exists) {
        setError('You already have a submission for this requirement. Edit or delete it first.');
        return;
      }
    } else if (formMode === 'edit') {
      if (!editingId || !selectedFile) {
        setError('Choose a new PDF or photo file to update your submission.');
        return;
      }
    } else {
      return;
    }

    setUploading(true);
    try {
      const { dataUrl, fileName } = await readRequirementFile(selectedFile);
      if (formMode === 'add') {
        submitRequirement({
          student_id: student.id,
          requirement_id: Number(requirementId),
          file_path: dataUrl,
          file_name: fileName,
        });
        setMsg('Requirement added successfully.');
      } else if (editingId) {
        const result = updateStudentRequirementSubmission(
          editingId,
          student.id,
          dataUrl,
          fileName
        );
        if (!result.ok) {
          setError(result.error ?? 'Could not update submission.');
          return;
        }
        setMsg('Requirement updated successfully.');
      }
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = (submissionId: number) => {
    if (!student) return;
    const sub = submissions.find((s) => s.id === submissionId);
    if (!sub) return;
    if (sub.status === 'approved') {
      setError('Approved submissions cannot be deleted.');
      return;
    }
    if (!confirm('Delete this submission? You can add it again later.')) return;
    const result = deleteStudentRequirementSubmission(submissionId, student.id);
    if (!result.ok) {
      setError(result.error ?? 'Could not delete submission.');
      return;
    }
    setMsg('Submission deleted.');
    if (editingId === submissionId) resetForm();
    if (viewId === submissionId) setViewId(null);
  };

  const availableTemplates = templates.filter(
    (t) => !submissions.some((s) => s.requirement_id === t.id)
  );

  const canModify = (status: string) => status !== 'approved';

  return (
    <>
      <PageHeader
        title="Requirements"
        subtitle="Add, edit, or delete your requirement submissions (PDF or photo)"
      />
      {msg && <Alert type="success">{msg}</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      <div className="flex flex-wrap gap-2 mb-4">
        <Button type="button" onClick={openAdd} disabled={availableTemplates.length === 0}>
          Add Submission
        </Button>
        {formMode && (
          <Button type="button" variant="secondary" onClick={resetForm}>
            Cancel
          </Button>
        )}
      </div>

      {templates.length > 0 && (
        <Card title="Required Documents" className="mb-4">
          <Table headers={['Name', 'Description', 'Deadline', 'Your status']}>
            {templates.map((t) => {
              const sub = submissions.find((s) => s.requirement_id === t.id);
              return (
                <tr key={t.id}>
                  <td className={tableCellMedium}>{t.name}</td>
                  <td className={`${tableCell} max-w-xs truncate`} title={t.description}>
                    {t.description}
                  </td>
                  <td className={tableCell}>{t.deadline}</td>
                  <td className={tableCell}>
                    {sub ? <StatusBadge status={sub.status} /> : (
                      <span className="text-zinc-500 text-xs">Not submitted</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </Table>
        </Card>
      )}

      {formMode && (
        <Card title={formMode === 'add' ? 'Add Submission' : 'Edit Submission'} className="mb-4">
          <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
            <div>
              <label htmlFor="requirement" className="block text-sm font-medium text-zinc-400 mb-1">
                Requirement
              </label>
              {formMode === 'edit' && editingSub ? (
                <p className="text-sm font-medium text-zinc-100 py-2">
                  {templates.find((r) => r.id === editingSub.requirement_id)?.name}
                </p>
              ) : (
                <select
                  id="requirement"
                  className="input-dark text-sm"
                  value={requirementId}
                  onChange={(e) => setRequirementId(e.target.value)}
                  required
                >
                  <option value="">Select requirement...</option>
                  {availableTemplates.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (due {r.deadline})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label htmlFor="requirement-file" className="block text-sm font-medium text-zinc-400 mb-1">
                Choose file (PDF or photo)
              </label>
              <input
                ref={fileInputRef}
                id="requirement-file"
                type="file"
                accept={REQUIREMENT_ACCEPT}
                onChange={handleFileChange}
                className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#7c3aed]/40 file:text-red-200 hover:file:bg-[#7c3aed]/60"
                required
              />
              <p className="text-xs text-muted mt-1">
                Accepted: PDF, JPG, PNG, GIF, WebP — max 2 MB
              </p>
              {formMode === 'edit' && editingSub && !selectedFile && (
                <div className="mt-2 text-xs text-muted">
                  Current file:{' '}
                  <RequirementFileLink
                    filePath={editingSub.file_path}
                    fileName={editingSub.file_name}
                  />
                </div>
              )}
              {selectedFile && (
                <div className="mt-3 rounded-lg border border-violet-500/50 bg-[#221b4a] p-3">
                  <p className="text-sm font-medium text-zinc-100">{selectedFile.name}</p>
                  <p className="text-xs text-muted">
                    {(selectedFile.size / 1024).toFixed(1)} KB · {selectedFile.type || 'file'}
                  </p>
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="mt-2 max-h-32 rounded border border-violet-550/60 object-contain"
                    />
                  )}
                  <button
                    type="button"
                    onClick={clearFile}
                    className="mt-2 text-xs link-danger"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>

            <div className="btn-row">
              <Button type="submit" disabled={uploading || !selectedFile}>
                {uploading
                  ? 'Saving…'
                  : formMode === 'add'
                    ? 'Add'
                    : 'Save Changes'}
              </Button>
              <Button type="button" variant="secondary" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {viewingSub && (
        <Card title="View Submission" className="mb-4">
          <div className="flex justify-between items-start gap-2 mb-3">
            <div>
              <p className="font-medium text-sm">
                {templates.find((r) => r.id === viewingSub.requirement_id)?.name}
              </p>
              <p className="text-xs text-muted">
                Submitted {new Date(viewingSub.submitted_at).toLocaleString()}
              </p>
            </div>
            <StatusBadge status={viewingSub.status} />
          </div>
          {viewingSub.remarks && (
            <p className="text-sm text-red-600 mb-2">Remarks: {viewingSub.remarks}</p>
          )}
          <RequirementFilePreview
            filePath={viewingSub.file_path}
            fileName={viewingSub.file_name}
          />
          <button
            type="button"
            onClick={() => setViewId(null)}
            className="mt-4 text-sm link-danger"
          >
            Close
          </button>
        </Card>
      )}

      <Card title="My Submissions">
        <Table headers={['Requirement', 'File', 'Submitted', 'Status', 'Actions']}>
          {submissions.length === 0 ? (
            <EmptyRow cols={5} message="No submissions yet. Click Add Submission to upload." />
          ) : (
            submissions.map((sub) => {
              const req = templates.find((r) => r.id === sub.requirement_id);
              return (
                <tr key={sub.id}>
                  <td className={tableCellMedium}>{req?.name ?? '—'}</td>
                  <td className={tableCell}>
                    <RequirementFileLink filePath={sub.file_path} fileName={sub.file_name} />
                  </td>
                  <td className={tableCell}>
                    {new Date(sub.submitted_at).toLocaleDateString()}
                  </td>
                  <td className={tableCell}>
                    <StatusBadge status={sub.status} />
                  </td>
                  <td className={`${tableCell} space-x-2 whitespace-nowrap`}>
                    <button
                      type="button"
                      onClick={() => {
                        setViewId(sub.id);
                        setFormMode(null);
                        setEditingId(null);
                      }}
                      className="link-action"
                    >
                      View
                    </button>
                    {canModify(sub.status) && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEdit(sub.id)}
                          className="link-edit"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(sub.id)}
                          className="link-danger"
                        >
                          Delete
                        </button>
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
