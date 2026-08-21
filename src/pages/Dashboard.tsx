import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight, Bell, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, FileCheck2, FileText, Lightbulb, Users, UploadCloud } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_META } from '@/components/AppShell';
import type { UserRole } from '@/types';
import { trpc } from '@/lib/trpc';
import type { ReactNode } from 'react';
import { AdminControlPlane } from '@/components/AdminControlPlane';

type Metric = { label: string; value: string; trend: string; tone?: string };
type Activity = { title: string; detail: string; status: 'success' | 'warning' | 'neutral' | 'danger'; statusLabel: string; icon: ReactNode; iconTone: string };

const roleCopy: Record<UserRole, { title: string; description: string }> = {
  learner: { title: 'Your learning overview', description: 'Keep your evidence moving, see what needs attention, and stay close to your qualification goals.' },
  assessor: { title: 'Assessment overview', description: 'Prioritise pending decisions, maintain feedback quality, and keep your learner caseload moving.' },
  trainer: { title: 'Training overview', description: 'Coordinate live learning, monitor attendance, and keep resources ready for every learner group.' },
  iqa: { title: 'Quality assurance overview', description: 'Review sampled decisions, support standardisation, and keep internal quality actions visible.' },
  eqa: { title: 'External review overview', description: 'See centre-level compliance, review external samples, and prepare a clear audit trail.' },
  admin: { title: 'Administration overview', description: 'Approve accounts, manage role access, and review the audit trail for every change.' },
};

const roleLinks: Record<UserRole, Array<{ to: string; label: string; description: string; icon: typeof BookOpen }>> = {
  learner: [{ to: '/portfolio', label: 'Open portfolio', description: 'Review units and recent evidence', icon: BookOpen }, { to: '/upload', label: 'Upload evidence', description: 'Attach a PDF or image submission', icon: UploadCloud }],
  assessor: [{ to: '/marking', label: 'Open marking suite', description: 'Work through pending decisions', icon: CheckCircle2 }, { to: '/dashboard?view=learners', label: 'View learner groups', description: 'See assigned learners and activity', icon: Users }],
  trainer: [{ to: '/dashboard?view=sessions', label: 'View sessions', description: 'Coordinate upcoming training', icon: CalendarDays }, { to: '/dashboard?view=learners', label: 'Review learner groups', description: 'Monitor attendance and progress', icon: Users }],
  iqa: [{ to: '/dashboard?view=sampling', label: 'Open sampling queue', description: 'Review decisions selected for sampling', icon: ClipboardCheck }, { to: '/dashboard?view=reports', label: 'View QA reports', description: 'Track standardisation actions', icon: FileCheck2 }],
  eqa: [{ to: '/dashboard?view=sampling', label: 'Review external sample', description: 'Inspect centre evidence and decisions', icon: ClipboardCheck }, { to: '/dashboard?view=reports', label: 'Open compliance report', description: 'Prepare the next review summary', icon: FileText }],
  admin: [{ to: '/dashboard?view=admin', label: 'Manage users', description: 'Approve identities and assign access', icon: Users }, { to: '/dashboard?view=admin#audit', label: 'Review audit log', description: 'Search access changes and approvals', icon: FileCheck2 }],
};

function statusClass(status: Activity['status']) { return `status-badge status-${status}`; }
function dateLabel(value: unknown) { const date = value ? new Date(String(value)) : null; return date && !Number.isNaN(date.valueOf()) ? date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'Date not recorded'; }
function countDistinct(rows: any[], key: string) { return new Set(rows.map((row) => row?.[key]).filter(Boolean)).size; }
function isActiveQuery(query: any) { return query.isLoading ? 'Loading…' : query.error ? 'Unavailable' : undefined; }

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const notificationsQuery = trpc.notifications.getByUser.useQuery({ userId: user?.id ?? 0 }, { enabled: Boolean(user?.id) });
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({ onSuccess: () => notificationsQuery.refetch() });
  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({ onSuccess: () => notificationsQuery.refetch() });

  const portfolioQuery = trpc.learning.getPortfolio.useQuery({ learnerId: user?.id ?? 0 }, { enabled: user?.role === 'learner' });
  const pendingQuery = trpc.submissions.getPendingMarking.useQuery(undefined, { enabled: user?.role === 'assessor' });
  const assessorMarkingsQuery = trpc.markings.getByAssessor.useQuery({ assessorId: user?.id ?? 0 }, { enabled: user?.role === 'assessor' });
  const sessionsQuery = trpc.sessions.getByTrainer.useQuery({ trainerId: user?.id ?? 0 }, { enabled: user?.role === 'trainer' });
  const samplesQuery = trpc.markings.getFlaggedForIqa.useQuery(undefined, { enabled: user?.role === 'iqa' || user?.role === 'eqa' });
  const complianceQuery = trpc.compliance.list.useQuery({ centreId: user?.centreId }, { enabled: user?.role === 'eqa' });
  if (!user) return null;
  const requestedView = new URLSearchParams(location.search).get('view');
  if (user.role === 'admin' && requestedView === 'admin') return <AdminControlPlane />;

  const portfolio = portfolioQuery.data ?? { portfolioUnits: [], submissions: [] };
  const submissions = portfolio.submissions ?? [];
  const portfolioUnits = portfolio.portfolioUnits ?? [];
  const pending = pendingQuery.data ?? [];
  const assessorMarkings = assessorMarkingsQuery.data ?? [];
  const sessions = sessionsQuery.data ?? [];
  const samples = samplesQuery.data ?? [];
  const compliance = complianceQuery.data ?? [];

  let metrics: Metric[] = [];
  let activity: Activity[] = [];
  let progress = 0;
  let progressCopy = 'Current programme health';

  if (user.role === 'learner') {
    const completed = portfolioUnits.filter((unit: any) => ['passed', 'marked'].includes(unit.status)).length;
    const passed = portfolioUnits.filter((unit: any) => unit.status === 'passed').length;
    progress = portfolioUnits.length ? Math.round((completed / portfolioUnits.length) * 100) : 0;
    progressCopy = portfolioUnits.length ? `${completed} of ${portfolioUnits.length} units progressed` : 'No portfolio units assigned yet';
    metrics = [
      { label: 'Units in programme', value: String(portfolioUnits.length), trend: portfolioQuery.isLoading ? 'Loading portfolio…' : 'Persisted portfolio records' },
      { label: 'Completed', value: String(passed), trend: portfolioQuery.isLoading ? 'Loading…' : 'Passed portfolio units', tone: 'success' },
      { label: 'Evidence submitted', value: String(submissions.length), trend: portfolioQuery.isLoading ? 'Loading…' : 'Submission records', tone: 'warning' },
      { label: 'Overall progress', value: `${progress}%`, trend: portfolioQuery.error ? 'Database unavailable' : 'Derived from portfolio status', tone: 'purple' },
    ];
    activity = submissions.slice(0, 3).map((submission: any) => ({ title: submission.title, detail: `Unit ${submission.unitId} · ${dateLabel(submission.submittedAt ?? submission.createdAt)}`, status: submission.status === 'passed' ? 'success' : submission.status === 'referred' ? 'danger' : 'warning', statusLabel: submission.status ?? 'Unknown', icon: <FileText size={16} />, iconTone: 'teal' }));
  } else if (user.role === 'assessor') {
    metrics = [
      { label: 'Pending marking', value: String(pending.length), trend: pendingQuery.isLoading ? 'Loading queue…' : 'Submitted evidence awaiting review', tone: 'warning' },
      { label: 'Marked records', value: String(assessorMarkings.length), trend: assessorMarkingsQuery.isLoading ? 'Loading…' : 'Your persisted marking records' },
      { label: 'Learners in queue', value: String(countDistinct(pending, 'learnerId')), trend: 'Distinct learner records' },
      { label: 'IQA flagged', value: String(assessorMarkings.filter((marking: any) => marking.flaggedForIqa).length), trend: 'Your records flagged for quality review' },
    ];
    activity = pending.slice(0, 3).map((submission: any) => ({ title: submission.title, detail: `Learner #${submission.learnerId} · submitted ${dateLabel(submission.submittedAt)}`, status: 'danger', statusLabel: 'Needs marking', icon: <FileText size={16} />, iconTone: 'teal' }));
  } else if (user.role === 'trainer') {
    const upcoming = sessions.filter((session: any) => session.status === 'scheduled');
    metrics = [
      { label: 'Training sessions', value: String(sessions.length), trend: sessionsQuery.isLoading ? 'Loading sessions…' : 'Persisted session records' },
      { label: 'Upcoming', value: String(upcoming.length), trend: 'Scheduled sessions' },
      { label: 'Completed sessions', value: String(sessions.filter((session: any) => session.status === 'completed').length), trend: 'Attendance records can be reviewed in session detail' },
      { label: 'Programme activity', value: sessions.length ? 'Active' : '—', trend: sessionsQuery.error ? 'Database unavailable' : 'Based on session records' },
    ];
    activity = sessions.slice(0, 3).map((session: any) => ({ title: session.title, detail: `${dateLabel(session.startDate)} · ${session.location ?? 'Location not recorded'}`, status: session.status === 'completed' ? 'success' : 'neutral', statusLabel: session.status ?? 'Unknown', icon: <CalendarDays size={16} />, iconTone: 'navy' }));
  } else if (user.role === 'admin') {
    metrics = [
      { label: 'Users requiring approval', value: '—', trend: 'Open User administration to load live records', tone: 'warning' },
      { label: 'Access changes', value: '—', trend: 'Searchable audit records available in the control plane' },
      { label: 'Role policy', value: 'RBAC', trend: 'Server-authoritative permissions' },
      { label: 'Audit posture', value: 'Tracked', trend: 'Every approval and access change is logged', tone: 'purple' },
    ];
    activity = [];
  } else if (user.role === 'iqa') {
    metrics = [
      { label: 'Samples to review', value: String(samples.length), trend: samplesQuery.isLoading ? 'Loading sampling queue…' : 'Flagged marking records', tone: 'warning' },
      { label: 'Flagged decisions', value: String(samples.filter((marking: any) => marking.flaggedForIqa).length), trend: 'Persisted assessor flags' },
      { label: 'Reviewed flags', value: String(samples.filter((marking: any) => marking.markedAt).length), trend: 'Marking records with timestamps' },
      { label: 'Quality data', value: samplesQuery.error ? 'Unavailable' : samples.length ? 'Available' : '—', trend: 'No synthetic metrics' },
    ];
    activity = samples.slice(0, 3).map((marking: any) => ({ title: `Marking #${marking.id}`, detail: `Submission #${marking.submissionId} · ${dateLabel(marking.markedAt)}`, status: 'warning', statusLabel: 'Open sample', icon: <ClipboardCheck size={16} />, iconTone: 'teal' }));
  } else {
    const compliant = compliance.filter((record: any) => record.status === 'compliant').length;
    progress = compliance.length ? Math.round((compliant / compliance.length) * 100) : 0;
    metrics = [
      { label: 'Compliance records', value: String(compliance.length), trend: complianceQuery.isLoading ? 'Loading compliance…' : 'Persisted centre records' },
      { label: 'Compliant', value: String(compliant), trend: 'Records currently compliant', tone: 'success' },
      { label: 'Needs improvement', value: String(compliance.filter((record: any) => record.status === 'needs-improvement').length), trend: 'Open improvement records', tone: 'warning' },
      { label: 'Open actions', value: String(compliance.filter((record: any) => record.status === 'non-compliant').length), trend: complianceQuery.error ? 'Database unavailable' : 'Non-compliant records', tone: 'purple' },
    ];
    activity = compliance.slice(0, 3).map((record: any) => ({ title: record.recordType, detail: `${record.status} · reviewed ${dateLabel(record.reviewDate)}`, status: record.status === 'compliant' ? 'success' : 'danger', statusLabel: record.status, icon: <FileCheck2 size={16} />, iconTone: 'navy' }));
  }

  const role = ROLE_META[user.role];
  const content = roleCopy[user.role];
  const links = roleLinks[user.role];
  const pageLoading = [portfolioQuery, pendingQuery, assessorMarkingsQuery, sessionsQuery, samplesQuery, complianceQuery].some((query) => query.isLoading && query.fetchStatus !== 'idle');

  return <div>
    <div className="page-heading"><div><div className="eyebrow">{role.label} workspace</div><h2>{content.title}</h2><p>{content.description}</p></div><div className="page-heading-actions"><Link to="/dashboard?view=notifications" className="button-secondary"><BellIcon /> Notifications</Link></div></div>
    {pageLoading && <div className="notice" style={{ marginBottom: 18 }}>Loading live records from LearnPort…</div>}
    {(portfolioQuery.error || pendingQuery.error || assessorMarkingsQuery.error || sessionsQuery.error || samplesQuery.error || complianceQuery.error) && <div className="notice warning-notice" style={{ marginBottom: 18 }}>Some live records could not be loaded. The values shown are database-backed records that were available; retry the page when the service is reachable.</div>}
    {new URLSearchParams(location.search).get('view') === 'notifications' && <NotificationsPanel notifications={notificationsQuery.data ?? []} isLoading={notificationsQuery.isLoading} error={notificationsQuery.error} onRead={(id) => markAsReadMutation.mutate({ notificationId: id })} onReadAll={() => markAllAsReadMutation.mutate({ userId: user.id })} isSaving={markAsReadMutation.isPending || markAllAsReadMutation.isPending} />}
    <div className="dashboard-grid">{metrics.map((metric) => <div className="metric-card" key={metric.label}><span className="metric-label">{metric.label}</span><div className={`metric-value ${metric.tone ?? ''}`}>{metric.value}</div><span className="metric-trend">{metric.trend}</span></div>)}</div>
    <div className="dashboard-columns"><section className="surface-card"><div className="card-header"><div><h3>Priority activity</h3><p>Recent persisted records that need your attention.</p></div><button className="card-link" onClick={() => window.location.reload()}>Refresh</button></div><div className="list-stack">{activity.length ? activity.map((item) => <div className="list-row" key={`${item.title}-${item.detail}`}><span className={`row-icon ${item.iconTone === 'navy' ? 'navy' : ''}`}>{item.icon}</span><div className="list-row-main"><strong>{item.title}</strong><small>{item.detail}</small></div><span className={statusClass(item.status)}>{item.statusLabel}</span><ArrowUpRight size={15} color="#9aa9b8" /></div>) : <div className="empty-state compact"><div><strong>No activity recorded yet</strong><p>New records will appear here once your centre has saved them.</p></div></div>}</div></section><section className="surface-card"><div className="card-header"><div><h3>Quick actions</h3><p>Jump into your role-specific workspace.</p></div><Lightbulb size={17} color="#e4a83d" /></div><div className="quick-grid">{links.map(({ to, label, description, icon: Icon }) => <Link key={label} to={to} className="quick-action"><span className="quick-action-icon"><Icon size={16} /></span><span><strong>{label}</strong><small>{description}</small></span></Link>)}</div><div className="callout" style={{ marginTop: 16 }}><Lightbulb size={16} /><div><strong>Keep the trail clear</strong><p>Use notes and status updates to make the next handover easier for your team.</p></div></div></section></div>
    <section className="surface-card" style={{ marginTop: 18 }}><div className="card-header"><div><h3>Progress snapshot</h3><p>{progressCopy}</p></div><span className={statusClass(progress ? 'success' : 'neutral')}>{progress ? 'Live data' : 'No records'}</span></div><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><div className="progress-copy"><span>{progress ? 'Derived from persisted records' : 'Awaiting persisted records'}</span><strong>{progress}%</strong></div></section>
  </div>;
}

function BellIcon() { return <span aria-hidden="true">◌</span>; }

function NotificationsPanel({ notifications, isLoading, error, onRead, onReadAll, isSaving }: { notifications: any[]; isLoading: boolean; error: unknown; onRead: (id: number) => void; onReadAll: () => void; isSaving: boolean }) {
  return <section className="surface-card" style={{ marginBottom: 18 }}><div className="card-header"><div><h3>Notifications inbox</h3><p>Durable events saved for your account across devices.</p></div><button className="button-quiet" disabled={isSaving || !notifications.some((notification) => !notification.read)} onClick={onReadAll}>Mark all read</button></div>{isLoading && <div className="notice">Loading saved notifications…</div>}{Boolean(error) && <div className="notice warning-notice">Notifications are unavailable. Retry when the API is reachable.</div>}{!isLoading && !error && !notifications.length && <div className="empty-state compact"><Bell size={22} color="#9aa9b8" /><div><strong>No notifications</strong><p>New assessment updates will appear here and as an instant toast.</p></div></div>}<div className="list-stack">{notifications.map((notification: any) => <div className="list-row" key={notification.id} style={{ background: notification.read ? '#fcfdfe' : '#f0faf8' }}><span className="row-icon"><Bell size={16} /></span><span className="list-row-main"><strong>{notification.title}</strong><small>{notification.message ?? 'Open LearnPort for more detail.'}</small></span><span className={`status-badge ${notification.read ? 'status-neutral' : 'status-warning'}`}>{notification.read ? 'Read' : 'New'}</span>{!notification.read && <button className="button-quiet" disabled={isSaving} onClick={() => onRead(notification.id)}>Mark read</button>}</div>)}</div></section>;
}
