import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FileText, Image, UploadCloud, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isEvidenceFileAllowed } from '@/lib/web-compatibility';
import { getApiBaseUrl, trpc } from '@/lib/trpc';
import { DEMO_UNITS } from '@/lib/demo-data';

type UploadedFile = { id: string; file: File; name: string; size: number; type: string; progress: number; status: 'uploading' | 'ready' | 'error'; url?: string };
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function FileUpload() {
  const { user, isDemo } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedCriterion, setSelectedCriterion] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const unitsQuery = trpc.learning.listUnits.useQuery(undefined, { enabled: user?.role === 'learner' && !isDemo });
  const criteriaQuery = trpc.learning.getCriteriaByUnit.useQuery({ unitId: Number(selectedUnit) }, { enabled: user?.role === 'learner' && Boolean(selectedUnit) && !isDemo });
  const createSubmissionMutation = trpc.submissions.create.useMutation();
  const updateStatusMutation = trpc.submissions.updateStatus.useMutation();

  useEffect(() => { setSelectedCriterion(''); }, [selectedUnit]);
  if (user?.role !== 'learner') return <div className="notice warning-notice">Evidence upload is available to Learner accounts. Your access is determined by the authenticated LearnPort role.</div>;

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    const accepted = Array.from(fileList).filter((file) => isEvidenceFileAllowed(file, MAX_FILE_SIZE));
    const rejected = Array.from(fileList).filter((file) => !isEvidenceFileAllowed(file, MAX_FILE_SIZE));
    if (rejected.length) setError(`${rejected.length} file${rejected.length > 1 ? 's were' : ' was'} not added. Use PDFs or images up to 50MB.`);
    if (!accepted.length) return;
    setError('');
    if (isDemo) {
      setFiles((current) => [...current, ...accepted.map((file): UploadedFile => ({ id: `${file.name}-${file.lastModified}-${file.size}`, file, name: file.name, size: file.size, type: file.type, progress: 100, status: 'ready', url: URL.createObjectURL(file) }))]);
      return;
    }
    await Promise.all(accepted.map(async (file) => {
      const item: UploadedFile = { id: `${file.name}-${file.lastModified}-${file.size}`, file, name: file.name, size: file.size, type: file.type, progress: 10, status: 'uploading' };
      setFiles((current) => [...current, item]);
      try {
        const response = await fetch(`${getApiBaseUrl()}/api/evidence/upload`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type': file.type || 'application/octet-stream', 'X-File-Name': encodeURIComponent(file.name) }, body: file });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(payload.error || 'Evidence upload failed');
        setFiles((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress: 100, status: 'ready', url: payload.url } : entry));
      } catch (uploadError) {
        setFiles((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress: 0, status: 'error' } : entry));
        setError(uploadError instanceof Error ? uploadError.message : 'Evidence upload failed.');
      }
    }));
  };
  const submit = async () => {
    if (!user || !title.trim() || !selectedUnit || !selectedCriterion || !files.length || files.some((file) => file.status !== 'ready' || !file.url)) return;
    setError(''); setNotice('');
    if (isDemo) {
      setNotice(`${files.length} demo evidence file${files.length > 1 ? 's are' : ' is'} ready. In a connected account this action would create a submitted record for your assessor.`);
      return;
    }
    try {
      const saved = await Promise.all(files.map((file) => createSubmissionMutation.mutateAsync({ learnerId: user.id, unitId: Number(selectedUnit), criterionId: Number(selectedCriterion), title: title.trim(), description: notes.trim() || undefined, fileUrl: file.url })));
      await Promise.all(saved.map((result: any) => updateStatusMutation.mutateAsync({ submissionId: Number(result.id), status: 'submitted', submittedAt: new Date() })));
      setNotice(`${saved.length} evidence file${saved.length > 1 ? 's were' : ' was'} uploaded and submitted to your assessor.`);
      setFiles([]); setSelectedUnit(''); setSelectedCriterion(''); setTitle(''); setNotes('');
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'The submission could not be saved.'); }
  };
  const clear = () => { setFiles([]); setSelectedUnit(''); setSelectedCriterion(''); setTitle(''); setNotes(''); setError(''); setNotice(''); };
  const isSubmitting = createSubmissionMutation.isPending || updateStatusMutation.isPending;
  const ready = files.length > 0 && files.every((file) => file.status === 'ready' && file.url);
  const availableUnits = isDemo ? DEMO_UNITS : (unitsQuery.data ?? []);
  const availableCriteria = isDemo ? (DEMO_UNITS.find((unit) => unit.id === Number(selectedUnit))?.criteria ?? []) : (criteriaQuery.data ?? []);

  return <div>
    <div className="page-heading"><div><div className="eyebrow">Learner workspace</div><h2>Upload evidence</h2><p>Add a clear title, select the unit and criterion, and attach supporting PDF or image files. Your submission is stored for assessor review.</p></div></div>
    {isDemo && <div className="notice demo-mode-notice" style={{ marginBottom: 18 }}>Demo workspace: files are previewed locally and are not sent to the connected database.</div>}
    {notice && <div className="notice">{notice}</div>}{error && <div className="notice warning-notice">{error}</div>}
    {!isDemo && (unitsQuery.isLoading || criteriaQuery.isLoading) && <div className="notice" style={{ marginBottom: 18 }}>Loading persisted learning units and criteria…</div>}
    {!isDemo && (unitsQuery.error || criteriaQuery.error) && <div className="notice warning-notice" style={{ marginBottom: 18 }}>The unit catalogue could not be loaded. Retry when the database service is reachable.</div>}
    <section className="surface-card"><div className="form-grid"><div className="form-field"><label className="form-label" htmlFor="submission-title">Submission title</label><input id="submission-title" className="form-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Customer service reflective account" /><span className="form-help">Use a title your assessor can recognise quickly.</span></div><div className="form-field"><label className="form-label" htmlFor="submission-unit">Unit</label><select id="submission-unit" className="form-select" value={selectedUnit} onChange={(event) => setSelectedUnit(event.target.value)}><option value="">Choose a {isDemo ? 'demo' : 'persisted'} unit</option>{availableUnits.map((unit: any) => <option key={unit.id} value={unit.id}>{unit.code} · {unit.title}</option>)}</select><span className="form-help">Units are loaded from your LearnPort programme catalogue.</span></div><div className="form-field"><label className="form-label" htmlFor="submission-criterion">Criterion</label><select id="submission-criterion" className="form-select" value={selectedCriterion} onChange={(event) => setSelectedCriterion(event.target.value)} disabled={!selectedUnit || criteriaQuery.isLoading}><option value="">Choose a criterion</option>{availableCriteria.map((criterion: any) => <option key={criterion.id} value={criterion.id}>{criterion.code} · {criterion.description}</option>)}</select><span className="form-help">Choose the persisted criterion this evidence supports.</span></div><div className="form-field form-field-full"><label className="form-label">Evidence files</label><button type="button" className={`surface-card ${dragActive ? 'upload-dropzone-active' : ''}`} style={{ minHeight: 184, border: `2px dashed ${dragActive ? '#1c8b83' : '#cdd9e4'}`, background: dragActive ? '#f0faf8' : '#fbfcfe', boxShadow: 'none', cursor: 'pointer' }} onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(event) => { event.preventDefault(); setDragActive(false); void handleFiles(event.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()}><UploadCloud size={30} color="#1c8b83" style={{ margin: '0 auto 10px' }} /><strong style={{ display: 'block', color: '#143b5d', fontSize: 13 }}>{dragActive ? 'Drop your files here' : 'Drop files here or browse from your device'}</strong><span style={{ display: 'block', marginTop: 7, color: '#6d7b8f', fontSize: 11 }}>PDF and image files · maximum 50MB per file</span><input ref={fileInputRef} type="file" multiple accept="application/pdf,image/*" onChange={(event) => { void handleFiles(event.target.files); event.currentTarget.value = ''; }} style={{ display: 'none' }} /></button></div></div>{files.length > 0 && <div style={{ marginTop: 21 }}><div className="card-header"><div><h3>Attached files</h3><p>{files.length} file{files.length > 1 ? 's' : ''} uploaded to secure storage.</p></div></div><div className="list-stack">{files.map((file) => <div className="list-row" key={file.id}><span className="row-icon">{file.type.startsWith('image/') ? <Image size={16} /> : <FileText size={16} />}</span><span className="list-row-main"><strong>{file.name}</strong><small>{formatBytes(file.size)} · {file.status === 'ready' ? 'Stored and ready' : file.status === 'error' ? 'Upload failed' : 'Uploading…'}</small>{file.status === 'uploading' && <span className="progress-track" style={{ display: 'block', marginTop: 7 }}><span className="progress-fill" style={{ display: 'block', width: `${file.progress}%` }} /></span>}</span>{file.status === 'ready' && <CheckCircle2 size={17} color="#1c8b83" />}<button className="icon-button" onClick={(event) => { event.stopPropagation(); setFiles((current) => current.filter((entry) => entry.id !== file.id)); }} aria-label={`Remove ${file.name}`}><X size={15} /></button></div>)}</div></div>}<div className="form-field" style={{ marginTop: 21 }}><label className="form-label" htmlFor="submission-notes">Submission notes <span style={{ color: '#9aa9b8', fontWeight: 500 }}>(optional)</span></label><textarea id="submission-notes" className="form-textarea" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Explain what this evidence demonstrates or mention anything your assessor should know." /></div><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}><button className="button-secondary" onClick={clear}>Clear</button><button className="button-primary" disabled={!title.trim() || !selectedUnit || !selectedCriterion || !ready || isSubmitting} onClick={() => void submit()}><UploadCloud size={15} /> {isSubmitting ? 'Saving…' : 'Submit evidence'}</button></div></section>
  </div>;
}

function formatBytes(bytes: number) { if (!bytes) return '0 Bytes'; const units = ['Bytes', 'KB', 'MB']; const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${Math.round((bytes / 1024 ** index) * 10) / 10} ${units[index]}`; }
