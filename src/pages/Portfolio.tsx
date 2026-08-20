import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowUpRight, CheckCircle2, FileText, FolderOpen, UploadCloud, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type PortfolioUnit = { id: number; code: string; title: string; progress: number; submissions: number; status: 'in-progress' | 'completed' | 'referred'; next: string };

const units: PortfolioUnit[] = [
  { id: 1, code: 'Unit 1', title: 'Customer Service', progress: 80, submissions: 3, status: 'in-progress', next: 'Submit final reflective account' },
  { id: 2, code: 'Unit 2', title: 'Business Administration', progress: 100, submissions: 5, status: 'completed', next: 'Unit completed' },
  { id: 3, code: 'Unit 3', title: 'Communication', progress: 40, submissions: 2, status: 'in-progress', next: 'Upload presentation evidence' },
  { id: 4, code: 'Unit 4', title: 'Digital Working Practices', progress: 22, submissions: 1, status: 'referred', next: 'Address assessor feedback' },
];

export function Portfolio() {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<PortfolioUnit | null>(null);
  const [filter, setFilter] = useState<'all' | PortfolioUnit['status']>('all');

  if (user?.role !== 'learner') return <AccessNotice />;
  const filteredUnits = filter === 'all' ? units : units.filter((unit) => unit.status === filter);
  const average = Math.round(units.reduce((sum, unit) => sum + unit.progress, 0) / units.length);

  return (
    <div>
      <div className="page-heading"><div><div className="eyebrow">Learner workspace</div><h2>My portfolio</h2><p>Keep every unit, submission and feedback action together. Your latest evidence stays visible from first draft to final decision.</p></div><div className="page-heading-actions"><Link to="/upload" className="button-primary"><UploadCloud size={16} /> Upload evidence</Link></div></div>
      <div className="dashboard-grid">
        <Metric label="Units in programme" value={String(units.length)} detail="4 active learning areas" />
        <Metric label="Completed" value={String(units.filter((unit) => unit.status === 'completed').length)} detail="Ready for next unit" tone="success" />
        <Metric label="Evidence submitted" value={String(units.reduce((sum, unit) => sum + unit.submissions, 0))} detail="3 awaiting feedback" tone="warning" />
        <Metric label="Overall progress" value={`${average}%`} detail="Keep building momentum" tone="purple" />
      </div>

      <section className="surface-card" style={{ marginTop: 18 }}>
        <div className="card-header"><div><h3>Qualification progress</h3><p>Choose a unit to see its evidence history and next action.</p></div><div className="page-heading-actions"><button className={`button-${filter === 'all' ? 'quiet' : 'secondary'}`} onClick={() => setFilter('all')}>All</button><button className={`button-${filter === 'in-progress' ? 'quiet' : 'secondary'}`} onClick={() => setFilter('in-progress')}>In progress</button><button className={`button-${filter === 'referred' ? 'quiet' : 'secondary'}`} onClick={() => setFilter('referred')}>Needs action</button></div></div>
        <div className="list-stack">{filteredUnits.map((unit) => <button key={unit.id} className="list-row" style={{ width: '100%', border: '1px solid #edf0f4', textAlign: 'left' }} onClick={() => setSelectedUnit(unit)}><span className="row-icon"><FolderOpen size={16} /></span><span className="list-row-main"><strong>{unit.code}: {unit.title}</strong><small>{unit.submissions} submissions · {unit.next}</small><span style={{ display: 'block', marginTop: 9 }}><span className="progress-track" style={{ display: 'block' }}><span className="progress-fill" style={{ display: 'block', width: `${unit.progress}%` }} /></span><span className="progress-copy"><span>{unit.progress}% complete</span><span>{unit.status === 'completed' ? 'Complete' : unit.status === 'referred' ? 'Action required' : 'In progress'}</span></span></span></span><span className={`status-badge ${unit.status === 'completed' ? 'status-success' : unit.status === 'referred' ? 'status-danger' : 'status-warning'}`}>{unit.status === 'in-progress' ? 'In progress' : unit.status}</span><ArrowUpRight size={15} color="#9aa9b8" /></button>)}</div>
      </section>

      <section className="dashboard-columns"><div className="surface-card"><div className="card-header"><div><h3>Recent evidence</h3><p>Track the latest files shared with your assessor.</p></div><FileText size={17} color="#1c8b83" /></div><div className="list-stack"><Evidence title="Customer Service reflective account" detail="Unit 1 · submitted yesterday" status="Awaiting review" tone="status-warning" /><Evidence title="Business Administration report" detail="Unit 2 · marked 12 May" status="Passed" tone="status-success" /><Evidence title="Communication presentation" detail="Unit 3 · draft saved" status="Draft" tone="status-neutral" /></div></div><div className="surface-card"><div className="card-header"><div><h3>Feedback to action</h3><p>Small next steps that keep your portfolio moving.</p></div><AlertCircle size={17} color="#e4a83d" /></div><div className="callout"><AlertCircle size={16} /><div><strong>Review assessor comments</strong><p>Unit 4 has been referred back. Read the feedback, update your evidence and resubmit when ready.</p><Link to="/upload" className="button-quiet" style={{ marginTop: 10 }}>Update evidence <ArrowUpRight size={14} /></Link></div></div></div></section>

      {selectedUnit && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedUnit(null)}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="unit-detail-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><div className="eyebrow">Unit detail</div><h3 id="unit-detail-title">{selectedUnit.code}: {selectedUnit.title}</h3><p>{selectedUnit.next}</p></div><button className="icon-button" onClick={() => setSelectedUnit(null)} aria-label="Close unit detail"><X size={17} /></button></div><div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}><Metric label="Progress" value={`${selectedUnit.progress}%`} detail="Current completion" /><Metric label="Submissions" value={String(selectedUnit.submissions)} detail="Evidence records" /></div><div className="surface-card" style={{ marginTop: 16, boxShadow: 'none', background: '#fbfcfe' }}><div className="card-header"><div><h3>Submission history</h3><p>Recent evidence linked to this unit.</p></div></div><div className="list-stack"><Evidence title={`${selectedUnit.code} evidence pack`} detail="Submitted 2 days ago" status={selectedUnit.status === 'referred' ? 'Referred' : selectedUnit.status === 'completed' ? 'Passed' : 'Awaiting review'} tone={selectedUnit.status === 'referred' ? 'status-danger' : selectedUnit.status === 'completed' ? 'status-success' : 'status-warning'} /><Evidence title="Planning notes and reflection" detail="Submitted last week" status="Marked" tone="status-success" /></div></div></div></div>}
    </div>
  );
}

function Metric({ label, value, detail, tone = 'default' }: { label: string; value: string; detail: string; tone?: string }) { return <div className="metric-card"><span className="metric-label">{label}</span><div className={`metric-value ${tone}`}>{value}</div><span className="metric-trend">{detail}</span></div>; }
function Evidence({ title, detail, status, tone }: { title: string; detail: string; status: string; tone: string }) { return <div className="list-row"><span className="row-icon"><FileText size={16} /></span><span className="list-row-main"><strong>{title}</strong><small>{detail}</small></span><span className={`status-badge ${tone}`}>{status}</span></div>; }
function AccessNotice() { return <div className="notice warning-notice">This portfolio view is available to Learner accounts. Choose the Learner role from the landing page to preview the full evidence journey.</div>; }
