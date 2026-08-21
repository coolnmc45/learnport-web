import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowUpRight, CheckCircle2, FileText, FolderOpen, UploadCloud, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';

type PortfolioUnit = { id: number; code: string; title: string; progress: number; submissions: number; status: 'in-progress' | 'completed' | 'referred' | 'not-started'; next: string; rawUnitId: number };

function mapStatus(status: string | null | undefined): PortfolioUnit['status'] {
  if (status === 'passed' || status === 'marked') return 'completed';
  if (status === 'referred') return 'referred';
  if (status === 'in-progress' || status === 'submitted') return 'in-progress';
  return 'not-started';
}
function progressFor(status: PortfolioUnit['status']) { return status === 'completed' ? 100 : status === 'in-progress' ? 50 : status === 'referred' ? 35 : 0; }
function statusCopy(status: PortfolioUnit['status']) { return status === 'completed' ? 'Unit completed' : status === 'referred' ? 'Address assessor feedback' : status === 'in-progress' ? 'Continue building evidence' : 'Start this unit'; }
function dateLabel(value: unknown) { const date = value ? new Date(String(value)) : null; return date && !Number.isNaN(date.valueOf()) ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Date not recorded'; }

export function Portfolio() {
  const { user } = useAuth();
  const [selectedUnit, setSelectedUnit] = useState<PortfolioUnit | null>(null);
  const [filter, setFilter] = useState<'all' | PortfolioUnit['status']>('all');
  const portfolioQuery = trpc.learning.getPortfolio.useQuery({ learnerId: user?.id ?? 0 }, { enabled: user?.role === 'learner' });
  const unitsQuery = trpc.learning.listUnits.useQuery(undefined, { enabled: user?.role === 'learner' });

  const portfolio = portfolioQuery.data ?? { portfolioUnits: [], submissions: [] };
  const submissions = portfolio.submissions ?? [];
  const units = useMemo(() => {
    const unitRows = unitsQuery.data ?? [];
    const portfolioRows = portfolio.portfolioUnits ?? [];
    const rowsByUnit = new Map<number, any>();
    portfolioRows.forEach((row: any) => rowsByUnit.set(row.unitId, row));
    const submissionUnitIds = new Set(submissions.map((submission: any) => submission.unitId));
    const ids = Array.from(new Set([...unitRows.map((unit: any) => unit.id), ...portfolioRows.map((row: any) => row.unitId), ...submissionUnitIds]));
    return ids.map((id) => {
      const unit = unitRows.find((candidate: any) => candidate.id === id);
      const row = rowsByUnit.get(id);
      const unitSubmissions = submissions.filter((submission: any) => submission.unitId === id);
      const status = mapStatus(row?.status ?? unitSubmissions[0]?.status);
      return { id, rawUnitId: id, code: unit?.code ?? `Unit ${id}`, title: unit?.title ?? 'Learning unit', progress: progressFor(status), submissions: unitSubmissions.length, status, next: statusCopy(status) };
    });
  }, [portfolio.portfolioUnits, submissions, unitsQuery.data]);
  if (user?.role !== 'learner') return <AccessNotice />;
  const filteredUnits = filter === 'all' ? units : units.filter((unit) => unit.status === filter);
  const average = units.length ? Math.round(units.reduce((sum, unit) => sum + unit.progress, 0) / units.length) : 0;

  return <div>
    <div className="page-heading"><div><div className="eyebrow">Learner workspace</div><h2>My portfolio</h2><p>Keep every unit, submission and feedback action together. Your latest evidence stays visible from first draft to final decision.</p></div><div className="page-heading-actions"><Link to="/upload" className="button-primary"><UploadCloud size={16} /> Upload evidence</Link></div></div>
    {(portfolioQuery.isLoading || unitsQuery.isLoading) && <div className="notice" style={{ marginBottom: 18 }}>Loading your persisted portfolio…</div>}
    {(portfolioQuery.error || unitsQuery.error) && <div className="notice warning-notice" style={{ marginBottom: 18 }}>Your portfolio could not be loaded completely. Retry when the database service is reachable.</div>}
    <div className="dashboard-grid"><Metric label="Units in programme" value={String(units.length)} detail={unitsQuery.error ? 'Unavailable' : 'Persisted learning units'} /><Metric label="Completed" value={String(units.filter((unit) => unit.status === 'completed').length)} detail="Passed portfolio units" tone="success" /><Metric label="Evidence submitted" value={String(submissions.length)} detail="Persisted submission records" tone="warning" /><Metric label="Overall progress" value={`${average}%`} detail={units.length ? 'Derived from unit status' : 'No portfolio records yet'} tone="purple" /></div>
    <section className="surface-card" style={{ marginTop: 18 }}><div className="card-header"><div><h3>Qualification progress</h3><p>Choose a unit to see its evidence history and next action.</p></div><div className="page-heading-actions"><button className={`button-${filter === 'all' ? 'quiet' : 'secondary'}`} onClick={() => setFilter('all')}>All</button><button className={`button-${filter === 'in-progress' ? 'quiet' : 'secondary'}`} onClick={() => setFilter('in-progress')}>In progress</button><button className={`button-${filter === 'referred' ? 'quiet' : 'secondary'}`} onClick={() => setFilter('referred')}>Needs action</button></div></div><div className="list-stack">{filteredUnits.length ? filteredUnits.map((unit) => <button key={unit.id} className="list-row" style={{ width: '100%', border: '1px solid #edf0f4', textAlign: 'left' }} onClick={() => setSelectedUnit(unit)}><span className="row-icon"><FolderOpen size={16} /></span><span className="list-row-main"><strong>{unit.code}: {unit.title}</strong><small>{unit.submissions} submissions · {unit.next}</small><span style={{ display: 'block', marginTop: 9 }}><span className="progress-track" style={{ display: 'block' }}><span className="progress-fill" style={{ display: 'block', width: `${unit.progress}%` }} /></span><span className="progress-copy"><span>{unit.progress}% complete</span><span>{unit.status === 'completed' ? 'Complete' : unit.status === 'referred' ? 'Action required' : unit.status === 'not-started' ? 'Not started' : 'In progress'}</span></span></span></span><span className={`status-badge ${unit.status === 'completed' ? 'status-success' : unit.status === 'referred' ? 'status-danger' : unit.status === 'not-started' ? 'status-neutral' : 'status-warning'}`}>{unit.status === 'in-progress' ? 'In progress' : unit.status === 'not-started' ? 'Not started' : unit.status}</span><ArrowUpRight size={15} color="#9aa9b8" /></button>) : <div className="empty-state compact"><div><strong>No persisted units yet</strong><p>Your centre will add learning units here when your programme is assigned.</p><Link to="/upload" className="button-primary" style={{ marginTop: 12 }}>Submit evidence</Link></div></div>}</div></section>
    <section className="dashboard-columns"><div className="surface-card"><div className="card-header"><div><h3>Recent evidence</h3><p>Track the latest files shared with your assessor.</p></div><FileText size={17} color="#1c8b83" /></div><div className="list-stack">{submissions.slice(0, 5).map((submission: any) => <Evidence key={submission.id} title={submission.title} detail={`Unit ${submission.unitId} · ${dateLabel(submission.submittedAt ?? submission.createdAt)}`} status={submission.status ?? 'Unknown'} tone={submission.status === 'passed' ? 'status-success' : submission.status === 'referred' ? 'status-danger' : 'status-warning'} />)}{!submissions.length && <div className="empty-state compact"><div><strong>No evidence submitted yet</strong><p>Upload a PDF or image to create your first persisted submission.</p></div></div>}</div></div><div className="surface-card"><div className="card-header"><div><h3>Feedback to action</h3><p>Small next steps that keep your portfolio moving.</p></div><AlertCircle size={17} color="#e4a83d" /></div><div className="callout"><AlertCircle size={16} /><div><strong>{units.some((unit) => unit.status === 'referred') ? 'Review assessor comments' : 'Keep evidence moving'}</strong><p>{units.some((unit) => unit.status === 'referred') ? 'A referred unit needs updated evidence before it can be resubmitted.' : 'Your next submission and assessor feedback will appear here once saved.'}</p><Link to="/upload" className="button-quiet" style={{ marginTop: 10 }}>Update evidence <ArrowUpRight size={14} /></Link></div></div></div></section>
    {selectedUnit && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelectedUnit(null)}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="unit-detail-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><div className="eyebrow">Unit detail</div><h3 id="unit-detail-title">{selectedUnit.code}: {selectedUnit.title}</h3><p>{selectedUnit.next}</p></div><button className="icon-button" onClick={() => setSelectedUnit(null)} aria-label="Close unit detail"><X size={17} /></button></div><div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}><Metric label="Progress" value={`${selectedUnit.progress}%`} detail="Derived from current status" /><Metric label="Submissions" value={String(selectedUnit.submissions)} detail="Persisted evidence records" /></div><div className="surface-card" style={{ marginTop: 16, boxShadow: 'none', background: '#fbfcfe' }}><div className="card-header"><div><h3>Submission history</h3><p>Evidence linked to this unit.</p></div></div><div className="list-stack">{submissions.filter((submission: any) => submission.unitId === selectedUnit.rawUnitId).map((submission: any) => <Evidence key={submission.id} title={submission.title} detail={`Saved ${dateLabel(submission.createdAt)}`} status={submission.status ?? 'Unknown'} tone={submission.status === 'passed' ? 'status-success' : submission.status === 'referred' ? 'status-danger' : 'status-warning'} />)}{!submissions.some((submission: any) => submission.unitId === selectedUnit.rawUnitId) && <div className="empty-state compact"><div><strong>No submissions for this unit</strong><p>Upload evidence to begin the unit history.</p></div></div>}</div></div></div></div>}
  </div>;
}

function Metric({ label, value, detail, tone = 'default' }: { label: string; value: string; detail: string; tone?: string }) { return <div className="metric-card"><span className="metric-label">{label}</span><div className={`metric-value ${tone}`}>{value}</div><span className="metric-trend">{detail}</span></div>; }
function Evidence({ title, detail, status, tone }: { title: string; detail: string; status: string; tone: string }) { return <div className="list-row"><span className="row-icon"><FileText size={16} /></span><span className="list-row-main"><strong>{title}</strong><small>{detail}</small></span><span className={`status-badge ${tone}`}>{status}</span></div>; }
function AccessNotice() { return <div className="notice warning-notice">This portfolio view is available to Learner accounts. Your access is determined by the authenticated LearnPort role.</div>; }
