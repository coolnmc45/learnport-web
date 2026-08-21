import { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2, FileCheck2, FileText, Lightbulb, Send, Sparkles, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { trpc } from '@/lib/trpc';

type MarkingStatus = 'pending' | 'marked' | 'referred';
type SubmissionForMarking = { id: number; learnerId: number; unitId: number; criterionId: number; fileUrl?: string | null; learnerName: string; unitCode: string; title: string; submittedDate: string; status: MarkingStatus };
type CriterionRow = { id: number; code: string; description: string };

function dateLabel(value: unknown) { const date = value ? new Date(String(value)) : null; return date && !Number.isNaN(date.valueOf()) ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'Date not recorded'; }
function statusTone(status: MarkingStatus) { return status === 'marked' ? 'status-success' : status === 'referred' ? 'status-danger' : 'status-warning'; }

export function MarkingSuite() {
  const { user } = useAuth();
  const [selected, setSelected] = useState<SubmissionForMarking | null>(null);
  const [filter, setFilter] = useState<'all' | MarkingStatus>('pending');
  const [grade, setGrade] = useState<'pass' | 'distinction' | 'refer' | ''>('');
  const [feedback, setFeedback] = useState('');
  const [criteriaState, setCriteriaState] = useState<Record<number, boolean>>({});
  const [iqaFlag, setIqaFlag] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [notice, setNotice] = useState('');

  const pendingQuery = trpc.submissions.getPendingMarking.useQuery(undefined, { enabled: user?.role === 'assessor' });
  const markingsQuery = trpc.markings.getByAssessor.useQuery({ assessorId: user?.id ?? 0 }, { enabled: user?.role === 'assessor' });
  const criteriaQuery = trpc.learning.getCriteriaByUnit.useQuery({ unitId: selected?.unitId ?? 0 }, { enabled: Boolean(selected) });
  const feedbackMutation = trpc.feedbackAssistant.generateFeedback.useMutation();
  const createMarkingMutation = trpc.markings.create.useMutation();

  const submissions = useMemo(() => {
    const pending = (pendingQuery.data ?? []).map((submission: any): SubmissionForMarking => ({ id: submission.id, learnerId: submission.learnerId, unitId: submission.unitId, criterionId: submission.criterionId, fileUrl: submission.fileUrl, learnerName: `Learner #${submission.learnerId}`, unitCode: `Unit #${submission.unitId}`, title: submission.title, submittedDate: dateLabel(submission.submittedAt ?? submission.createdAt), status: 'pending' }));
    const marked = (markingsQuery.data ?? []).map((marking: any): SubmissionForMarking => ({ id: marking.submissionId, learnerId: 0, unitId: 0, criterionId: 0, title: `Submission #${marking.submissionId}`, learnerName: 'Learner record', unitCode: 'Unit record', submittedDate: dateLabel(marking.markedAt), status: marking.grade === 'refer' ? 'referred' : 'marked' }));
    const seen = new Set(pending.map((submission) => submission.id));
    return [...pending, ...marked.filter((submission) => !seen.has(submission.id))];
  }, [markingsQuery.data, pendingQuery.data]);
  const filtered = filter === 'all' ? submissions : submissions.filter((submission) => submission.status === filter);
  const criteriaRows: CriterionRow[] = useMemo(() => {
    const rows = (criteriaQuery.data ?? []).map((criterion: any) => ({ id: criterion.id, code: criterion.code, description: criterion.description }));
    if (rows.length || !selected) return rows;
    return [{ id: selected.criterionId, code: `Criterion #${selected.criterionId}`, description: 'Review the evidence against the criterion linked to this submission.' }];
  }, [criteriaQuery.data, selected]);

  if (user?.role !== 'assessor') return <div className="notice warning-notice">This marking suite is available to Assessor accounts. Your access is determined by the authenticated LearnPort role.</div>;

  const openSubmission = (submission: SubmissionForMarking) => { setSelected(submission); setGrade(submission.status === 'marked' ? 'pass' : ''); setFeedback(''); setCriteriaState({}); setIqaFlag(false); setAiSuggestion(''); setNotice(''); };
  const generateFeedback = async () => {
    if (!selected || !grade) { setNotice('Choose a grade before generating feedback.'); return; }
    try {
      const result = await feedbackMutation.mutateAsync({ grade, submissionTitle: selected.title, unitTitle: selected.unitCode, criteria: criteriaRows.map((criterion) => ({ code: criterion.code, description: criterion.description, status: criteriaState[criterion.id] ? 'met' as const : 'not_met' as const })), learnerNotes: feedback });
      setAiSuggestion(String(result?.feedback ?? 'No suggestion was returned.'));
    } catch (error) { setNotice(error instanceof Error ? error.message : 'AI feedback is currently unavailable.'); }
  };
  const submitMarking = async () => {
    if (!selected || !grade || !user) return;
    try {
      await createMarkingMutation.mutateAsync({ submissionId: selected.id, assessorId: user.id, grade, overallFeedback: feedback.trim(), criterionFeedback: criteriaRows.map((criterion) => ({ criterionId: criterion.id, feedback: criteriaState[criterion.id] ? 'Criterion met based on submitted evidence.' : 'Further evidence or explanation is required for this criterion.' })), flaggedForIqa: iqaFlag });
      await Promise.all([pendingQuery.refetch(), markingsQuery.refetch()]);
      setNotice(`${selected.title} was saved to the database as ${grade}.`);
      setSelected(null);
    } catch (error) { setNotice(error instanceof Error ? error.message : 'The marking could not be saved.'); }
  };

  return <div>
    <div className="page-heading"><div><div className="eyebrow">Assessor workspace</div><h2>Marking suite</h2><p>Review submissions against clear criteria, create helpful feedback, and record an auditable assessment decision.</p></div><div className="page-heading-actions"><span className="status-badge status-danger">{submissions.filter((item) => item.status === 'pending').length} pending</span></div></div>
    {notice && <div className="notice" style={{ marginBottom: 18 }}>{notice}</div>}
    {(pendingQuery.isLoading || markingsQuery.isLoading) && <div className="notice" style={{ marginBottom: 18 }}>Loading persisted assessment records…</div>}
    {(pendingQuery.error || markingsQuery.error) && <div className="notice warning-notice" style={{ marginBottom: 18 }}>The assessment queue could not be loaded. Retry when the database service is reachable.</div>}
    <div className="dashboard-grid"><Metric label="Pending marking" value={String(submissions.filter((item) => item.status === 'pending').length)} detail="Persisted submitted evidence" tone="danger" /><Metric label="Marked records" value={String((markingsQuery.data ?? []).length)} detail="Your database marking records" tone="success" /><Metric label="Referred back" value={String(submissions.filter((item) => item.status === 'referred').length)} detail="Feedback action required" tone="warning" /><Metric label="IQA flagged" value={String((markingsQuery.data ?? []).filter((marking: any) => marking.flaggedForIqa).length)} detail="Ready for sampling" /></div>
    <section className="surface-card" style={{ marginTop: 18 }}><div className="card-header"><div><h3>Submission queue</h3><p>Open a persisted record to mark each criterion and generate feedback.</p></div><div className="page-heading-actions">{(['pending', 'all', 'marked', 'referred'] as const).map((item) => <button key={item} className={`button-${filter === item ? 'quiet' : 'secondary'}`} onClick={() => setFilter(item)}>{item === 'all' ? 'All work' : item}</button>)}</div></div><div className="list-stack">{filtered.length ? filtered.map((submission) => <button className="list-row" style={{ width: '100%', border: '1px solid #edf0f4', textAlign: 'left' }} key={submission.id} onClick={() => openSubmission(submission)}><span className="row-icon"><FileText size={16} /></span><span className="list-row-main"><strong>{submission.learnerName} · {submission.unitCode}: {submission.title}</strong><small>{submission.submittedDate} · {submission.status === 'pending' ? 'Awaiting your review' : 'Saved marking record'}</small></span><span className={`status-badge ${statusTone(submission.status)}`}>{submission.status}</span><span className="button-quiet" style={{ minHeight: 29, padding: '0 9px' }}>Review</span></button>) : <div className="empty-state compact"><div><strong>No persisted submissions in this view</strong><p>New learner submissions will appear here when saved by the service.</p></div></div>}</div></section>
    {selected && <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="marking-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><div className="eyebrow">Marking record</div><h3 id="marking-title">{selected.learnerName}</h3><p>{selected.unitCode}: {selected.title}</p></div><button className="icon-button" onClick={() => setSelected(null)} aria-label="Close marking record"><X size={17} /></button></div><div className="callout" style={{ marginBottom: 18 }}><FileCheck2 size={16} /><div><strong>{selected.fileUrl ? 'Evidence file attached' : 'No evidence file URL recorded'}</strong><p>{selected.fileUrl ? 'The stored evidence file is available for assessor review.' : 'This submission has no stored file yet.'}</p></div>{selected.fileUrl && <a className="button-quiet" style={{ marginLeft: 'auto' }} href={selected.fileUrl} target="_blank" rel="noreferrer">Preview</a>}</div><div className="form-field"><span className="form-label">Criteria review</span>{criteriaQuery.isLoading && <small>Loading criteria…</small>}{criteriaRows.map((criterion) => <label key={criterion.id} className="list-row" style={{ cursor: 'pointer' }}><input type="checkbox" checked={criteriaState[criterion.id] ?? false} onChange={(event) => setCriteriaState((current) => ({ ...current, [criterion.id]: event.target.checked }))} /><span className="list-row-main"><strong>{criterion.code}</strong><small>{criterion.description}</small></span>{criteriaState[criterion.id] ? <CheckCircle2 size={17} color="#1c8b83" /> : <AlertCircle size={17} color="#e4a83d" />}</label>)}</div><div className="form-field" style={{ marginTop: 20 }}><span className="form-label">Overall grade</span><div className="quick-grid" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>{(['pass', 'distinction', 'refer'] as const).map((item) => <button key={item} className={grade === item ? 'button-quiet' : 'button-secondary'} onClick={() => setGrade(item)}>{item}</button>)}</div></div><div className="form-field" style={{ marginTop: 20 }}><div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}><span className="form-label">Constructive feedback</span><button className="button-quiet" disabled={feedbackMutation.isPending} onClick={generateFeedback}><Sparkles size={14} /> {feedbackMutation.isPending ? 'Generating…' : 'Generate suggestion'}</button></div><textarea className="form-textarea" value={feedback} onChange={(event) => setFeedback(event.target.value)} placeholder="Write feedback for the learner, or use the assistant to create a first draft." />{aiSuggestion && <div className="callout"><Lightbulb size={16} /><div><strong>AI feedback suggestion</strong><p>{aiSuggestion}</p><button className="button-secondary" style={{ marginTop: 10 }} onClick={() => setFeedback(aiSuggestion)}>Use this feedback</button></div></div>}</div><label className="list-row" style={{ marginTop: 16, cursor: 'pointer' }}><input type="checkbox" checked={iqaFlag} onChange={(event) => setIqaFlag(event.target.checked)} /><span className="list-row-main"><strong>Flag for IQA review</strong><small>Send this decision to the internal quality sampling queue.</small></span><FileCheck2 size={17} color={iqaFlag ? '#7156b8' : '#9aa9b8'} /></label><div style={{ display: 'flex', gap: 10, marginTop: 21 }}><button className="button-primary" style={{ flex: 1 }} disabled={!grade || createMarkingMutation.isPending} onClick={submitMarking}><Send size={15} /> {createMarkingMutation.isPending ? 'Saving…' : 'Submit marking'}</button><button className="button-secondary" onClick={() => setSelected(null)}>Cancel</button></div></div></div>}
  </div>;
}

function Metric({ label, value, detail, tone = '' }: { label: string; value: string; detail: string; tone?: string }) { return <div className="metric-card"><span className="metric-label">{label}</span><div className={`metric-value ${tone}`}>{value}</div><span className="metric-trend">{detail}</span></div>; }
