import { useRef, useState } from 'react';
import { CheckCircle2, FileText, Image, UploadCloud, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isEvidenceFileAllowed } from '@/lib/web-compatibility';

type UploadedFile = { id: string; name: string; size: number; type: string; progress: number };
const MAX_FILE_SIZE = 50 * 1024 * 1024;

export function FileUpload() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  if (user?.role !== 'learner') return <div className="notice warning-notice">Evidence upload is available to Learner accounts. Choose the Learner role from the landing page to preview the submission journey.</div>;

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    const accepted = Array.from(fileList).filter((file) => isEvidenceFileAllowed(file, MAX_FILE_SIZE));
    const rejected = Array.from(fileList).filter((file) => !isEvidenceFileAllowed(file, MAX_FILE_SIZE));
    if (rejected.length) setError(`${rejected.length} file${rejected.length > 1 ? 's were' : ' was'} not added. Use PDFs or images up to 50MB.`);
    if (!accepted.length) return;
    setError('');
    accepted.filter((file) => file.size <= MAX_FILE_SIZE).forEach((file) => {
      const item = { id: `${file.name}-${file.lastModified}-${Math.random()}`, name: file.name, size: file.size, type: file.type, progress: 0 };
      setFiles((current) => [...current, item]);
      let progress = 0;
      const interval = window.setInterval(() => { progress = Math.min(100, progress + 25); setFiles((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress } : entry)); if (progress === 100) window.clearInterval(interval); }, 140);
    });
  };
  const submit = () => { if (!title.trim() || !selectedUnit || !files.length || files.some((file) => file.progress < 100)) return; setNotice('Evidence saved as a draft submission. In the connected deployment, it will now be sent to your assessor.'); setFiles([]); setSelectedUnit(''); setTitle(''); setNotes(''); };
  const clear = () => { setFiles([]); setSelectedUnit(''); setTitle(''); setNotes(''); setError(''); setNotice(''); };

  return <div>
    <div className="page-heading"><div><div className="eyebrow">Learner workspace</div><h2>Upload evidence</h2><p>Add a clear title, select the unit and attach your supporting PDF or image files. You can include a short note to guide your assessor.</p></div></div>
    {notice && <div className="notice">{notice}</div>}{error && <div className="notice warning-notice">{error}</div>}
    <section className="surface-card"><div className="form-grid"><div className="form-field"><label className="form-label" htmlFor="submission-title">Submission title</label><input id="submission-title" className="form-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Customer service reflective account" /><span className="form-help">Use a title your assessor can recognise quickly.</span></div><div className="form-field"><label className="form-label" htmlFor="submission-unit">Unit</label><select id="submission-unit" className="form-select" value={selectedUnit} onChange={(event) => setSelectedUnit(event.target.value)}><option value="">Choose a unit</option><option value="unit-1">Unit 1 · Customer Service</option><option value="unit-2">Unit 2 · Business Administration</option><option value="unit-3">Unit 3 · Communication</option><option value="unit-4">Unit 4 · Digital Working Practices</option></select><span className="form-help">Choose the unit and criteria your evidence supports.</span></div><div className="form-field form-field-full"><label className="form-label">Evidence files</label><button type="button" className={`surface-card ${dragActive ? 'upload-dropzone-active' : ''}`} style={{ minHeight: 184, border: `2px dashed ${dragActive ? '#1c8b83' : '#cdd9e4'}`, background: dragActive ? '#f0faf8' : '#fbfcfe', boxShadow: 'none', cursor: 'pointer' }} onDragEnter={(event) => { event.preventDefault(); setDragActive(true); }} onDragOver={(event) => { event.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={(event) => { event.preventDefault(); setDragActive(false); handleFiles(event.dataTransfer.files); }} onClick={() => fileInputRef.current?.click()}><UploadCloud size={30} color="#1c8b83" style={{ margin: '0 auto 10px' }} /><strong style={{ display: 'block', color: '#143b5d', fontSize: 13 }}>{dragActive ? 'Drop your files here' : 'Drop files here or browse from your device'}</strong><span style={{ display: 'block', marginTop: 7, color: '#6d7b8f', fontSize: 11 }}>PDF and image files · maximum 50MB per file</span><input ref={fileInputRef} type="file" multiple accept="application/pdf,image/*" onChange={(event) => handleFiles(event.target.files)} style={{ display: 'none' }} /></button></div></div>{files.length > 0 && <div style={{ marginTop: 21 }}><div className="card-header"><div><h3>Attached files</h3><p>{files.length} file{files.length > 1 ? 's' : ''} ready for this submission.</p></div></div><div className="list-stack">{files.map((file) => <div className="list-row" key={file.id}><span className="row-icon">{file.type.startsWith('image/') ? <Image size={16} /> : <FileText size={16} />}</span><span className="list-row-main"><strong>{file.name}</strong><small>{formatBytes(file.size)} · {file.progress === 100 ? 'Ready' : `Uploading ${file.progress}%`}</small>{file.progress < 100 && <span className="progress-track" style={{ display: 'block', marginTop: 7 }}><span className="progress-fill" style={{ display: 'block', width: `${file.progress}%` }} /></span>}</span>{file.progress === 100 && <CheckCircle2 size={17} color="#1c8b83" />}<button className="icon-button" onClick={() => setFiles((current) => current.filter((entry) => entry.id !== file.id))} aria-label={`Remove ${file.name}`}><X size={15} /></button></div>)}</div></div>}<div className="form-field" style={{ marginTop: 21 }}><label className="form-label" htmlFor="submission-notes">Submission notes <span style={{ color: '#9aa9b8', fontWeight: 500 }}>(optional)</span></label><textarea id="submission-notes" className="form-textarea" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Explain what this evidence demonstrates or mention anything your assessor should know." /></div><div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 22 }}><button className="button-secondary" onClick={clear}>Clear</button><button className="button-primary" disabled={!title.trim() || !selectedUnit || !files.length || files.some((file) => file.progress < 100)} onClick={submit}><UploadCloud size={15} /> Submit evidence</button></div></section>
  </div>;
}

function formatBytes(bytes: number) { if (!bytes) return '0 Bytes'; const units = ['Bytes', 'KB', 'MB']; const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1); return `${Math.round((bytes / 1024 ** index) * 10) / 10} ${units[index]}`; }
