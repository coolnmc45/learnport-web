import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, FileCheck2, FileText, Lightbulb, Users, UploadCloud } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ROLE_META } from '@/components/AppShell';
import type { UserRole } from '@/types';

const roleContent: Record<UserRole, { title: string; description: string; metrics: Array<{ label: string; value: string; trend: string }>; accent: string }> = {
  learner: {
    title: 'Your learning overview',
    description: 'Keep your evidence moving, see what needs attention, and stay close to your qualification goals.',
    metrics: [{ label: 'Qualification progress', value: '68%', trend: '+8% this month' }, { label: 'Evidence submitted', value: '12', trend: '3 awaiting review' }, { label: 'Units completed', value: '4 / 6', trend: '2 in progress' }, { label: 'Upcoming sessions', value: '3', trend: 'Next: Thursday' }],
    accent: 'learner',
  },
  assessor: {
    title: 'Assessment overview',
    description: 'Prioritise pending decisions, maintain feedback quality, and keep your learner caseload moving.',
    metrics: [{ label: 'Pending marking', value: '8', trend: '3 due this week' }, { label: 'Marked this month', value: '24', trend: '+12% vs last month' }, { label: 'Assigned learners', value: '12', trend: '2 new submissions' }, { label: 'IQA flagged', value: '2', trend: 'Review before Friday' }],
    accent: 'assessor',
  },
  trainer: {
    title: 'Training overview',
    description: 'Coordinate live learning, monitor attendance, and keep resources ready for every learner group.',
    metrics: [{ label: 'Upcoming sessions', value: '4', trend: 'Next: Tuesday 10:00' }, { label: 'Active learners', value: '38', trend: '92% attendance' }, { label: 'Learning resources', value: '18', trend: '4 recently added' }, { label: 'Follow-ups due', value: '6', trend: 'Prioritise 2 today' }],
    accent: 'trainer',
  },
  iqa: {
    title: 'Quality assurance overview',
    description: 'Review sampled decisions, support standardisation, and keep internal quality actions visible.',
    metrics: [{ label: 'Samples to review', value: '6', trend: '2 high priority' }, { label: 'Samples approved', value: '42', trend: '94% first pass' }, { label: 'Referred back', value: '3', trend: '1 requires action' }, { label: 'Assessor consistency', value: '91%', trend: '+4% this quarter' }],
    accent: 'iqa',
  },
  eqa: {
    title: 'External review overview',
    description: 'See centre-level compliance, review external samples, and prepare a clear audit trail.',
    metrics: [{ label: 'Compliance score', value: '94%', trend: '+3% this quarter' }, { label: 'Centres monitored', value: '12', trend: 'All reporting' }, { label: 'Reports generated', value: '8', trend: '2 awaiting sign-off' }, { label: 'Open actions', value: '4', trend: '1 due this week' }],
    accent: 'eqa',
  },
};

const roleLinks: Record<UserRole, Array<{ to: string; label: string; description: string; icon: typeof BookOpen }>> = {
  learner: [{ to: '/portfolio', label: 'Open portfolio', description: 'Review units and recent evidence', icon: BookOpen }, { to: '/upload', label: 'Upload evidence', description: 'Attach a PDF or image submission', icon: UploadCloud }],
  assessor: [{ to: '/marking', label: 'Open marking suite', description: 'Work through pending decisions', icon: CheckCircle2 }, { to: '/dashboard?view=learners', label: 'View learner groups', description: 'See assigned learners and activity', icon: Users }],
  trainer: [{ to: '/dashboard?view=sessions', label: 'View sessions', description: 'Coordinate upcoming training', icon: CalendarDays }, { to: '/dashboard?view=learners', label: 'Review learner groups', description: 'Monitor attendance and progress', icon: Users }],
  iqa: [{ to: '/dashboard?view=sampling', label: 'Open sampling queue', description: 'Review decisions selected for sampling', icon: ClipboardCheck }, { to: '/dashboard?view=reports', label: 'View QA reports', description: 'Track standardisation actions', icon: FileCheck2 }],
  eqa: [{ to: '/dashboard?view=sampling', label: 'Review external sample', description: 'Inspect centre evidence and decisions', icon: ClipboardCheck }, { to: '/dashboard?view=reports', label: 'Open compliance report', description: 'Prepare the next review summary', icon: FileText }],
};

function statusClass(status: 'success' | 'warning' | 'neutral' | 'danger') {
  return `status-badge status-${status}`;
}

export function Dashboard() {
  const { user } = useAuth();
  if (!user) return null;

  const content = roleContent[user.role];
  const links = roleLinks[user.role];
  const role = ROLE_META[user.role];

  return (
    <div>
      <div className="page-heading">
        <div><div className="eyebrow">{role.label} workspace</div><h2>{content.title}</h2><p>{content.description}</p></div>
        <div className="page-heading-actions"><Link to="/dashboard?view=notifications" className="button-secondary"><BellIcon /> Notifications</Link></div>
      </div>

      <div className="dashboard-grid">
        {content.metrics.map((metric, index) => <div className="metric-card" key={metric.label}><span className="metric-label">{metric.label}</span><div className="metric-value">{metric.value}</div><span className="metric-trend">{index === 3 ? '● ' : '↗ '}{metric.trend}</span></div>)}
      </div>

      <div className="dashboard-columns">
        <section className="surface-card">
          <div className="card-header"><div><h3>Priority activity</h3><p>Records and actions that need your attention next.</p></div><button className="card-link">View all</button></div>
          <div className="list-stack">
            {getPriorityActivity(user.role).map((item) => <div className="list-row" key={item.title}><span className={`row-icon ${item.iconTone === 'navy' ? 'navy' : ''}`}>{item.icon}</span><div className="list-row-main"><strong>{item.title}</strong><small>{item.detail}</small></div><span className={statusClass(item.status)}>{item.statusLabel}</span><ArrowUpRight size={15} color="#9aa9b8" /></div>)}
          </div>
        </section>
        <section className="surface-card">
          <div className="card-header"><div><h3>Quick actions</h3><p>Jump into the next useful step.</p></div><Lightbulb size={17} color="#e4a83d" /></div>
          <div className="quick-grid">{links.map(({ to, label, description, icon: Icon }) => <Link key={label} to={to} className="quick-action"><span className="quick-action-icon"><Icon size={16} /></span><span><strong>{label}</strong><small>{description}</small></span></Link>)}</div>
          <div className="callout" style={{ marginTop: 16 }}><Lightbulb size={16} /><div><strong>Keep the trail clear</strong><p>Use notes and status updates to make the next handover easier for your team.</p></div></div>
        </section>
      </div>

      <section className="surface-card" style={{ marginTop: 18 }}>
        <div className="card-header"><div><h3>Progress snapshot</h3><p>{user.role === 'learner' ? 'Your current qualification journey.' : 'A cross-workspace snapshot of current delivery.'}</p></div><span className={statusClass('success')}>On track</span></div>
        <div className="progress-track"><div className="progress-fill" style={{ width: user.role === 'eqa' ? '94%' : user.role === 'iqa' ? '91%' : user.role === 'assessor' ? '78%' : user.role === 'trainer' ? '86%' : '68%' }} /></div>
        <div className="progress-copy"><span>{user.role === 'learner' ? '4 of 6 units completed' : 'Current programme health'}</span><strong>{user.role === 'eqa' ? '94%' : user.role === 'iqa' ? '91%' : user.role === 'assessor' ? '78%' : user.role === 'trainer' ? '86%' : '68%'}</strong></div>
      </section>
    </div>
  );
}

function BellIcon() { return <span aria-hidden="true">◌</span>; }

function getPriorityActivity(role: UserRole) {
  const activity = {
    learner: [
      { title: 'Customer Service evidence', detail: 'Unit 1 · submitted yesterday', status: 'warning' as const, statusLabel: 'Awaiting review', icon: <FileText size={16} />, iconTone: 'teal' },
      { title: 'Business Administration', detail: 'Unit 2 · portfolio complete', status: 'success' as const, statusLabel: 'Passed', icon: <CheckCircle2 size={16} />, iconTone: 'teal' },
      { title: 'Progress review session', detail: 'Thursday · 10:00 with your trainer', status: 'neutral' as const, statusLabel: 'Scheduled', icon: <CalendarDays size={16} />, iconTone: 'navy' },
    ],
    assessor: [
      { title: 'Customer Service Evidence', detail: 'Alex Johnson · Unit 1 · submitted today', status: 'danger' as const, statusLabel: 'Needs marking', icon: <FileText size={16} />, iconTone: 'teal' },
      { title: 'Business Admin Report', detail: 'Jordan Smith · Unit 2 · submitted yesterday', status: 'danger' as const, statusLabel: 'Needs marking', icon: <FileText size={16} />, iconTone: 'teal' },
      { title: 'IQA sample requested', detail: 'Quality review · 1 submission flagged', status: 'warning' as const, statusLabel: 'Action needed', icon: <ClipboardCheck size={16} />, iconTone: 'navy' },
    ],
    trainer: [
      { title: 'Business communication workshop', detail: 'Tuesday · 10:00 · 14 attendees', status: 'neutral' as const, statusLabel: 'Scheduled', icon: <CalendarDays size={16} />, iconTone: 'navy' },
      { title: 'Resource pack refresh', detail: '4 resources need an accessibility check', status: 'warning' as const, statusLabel: 'Review', icon: <BookOpen size={16} />, iconTone: 'teal' },
      { title: 'Attendance follow-up', detail: '6 learners need a progress note', status: 'warning' as const, statusLabel: 'Action needed', icon: <Users size={16} />, iconTone: 'navy' },
    ],
    iqa: [
      { title: 'Sample: Unit 1 customer service', detail: 'Sarah Smith · 3 criteria to review', status: 'danger' as const, statusLabel: 'High priority', icon: <ClipboardCheck size={16} />, iconTone: 'teal' },
      { title: 'Assessor standardisation', detail: 'Next calibration session · Friday', status: 'neutral' as const, statusLabel: 'Scheduled', icon: <Users size={16} />, iconTone: 'navy' },
      { title: 'Referred sample feedback', detail: '1 assessor response is due', status: 'warning' as const, statusLabel: 'Action needed', icon: <FileCheck2 size={16} />, iconTone: 'teal' },
    ],
    eqa: [
      { title: 'Centre North review sample', detail: '6 records ready for external review', status: 'danger' as const, statusLabel: 'Open review', icon: <ClipboardCheck size={16} />, iconTone: 'teal' },
      { title: 'Compliance evidence pack', detail: 'Reporting window closes Friday', status: 'warning' as const, statusLabel: 'Due soon', icon: <FileCheck2 size={16} />, iconTone: 'navy' },
      { title: 'Centre South report', detail: 'Latest report submitted yesterday', status: 'success' as const, statusLabel: 'Complete', icon: <CheckCircle2 size={16} />, iconTone: 'teal' },
    ],
  } satisfies Record<UserRole, Array<{ title: string; detail: string; status: 'success' | 'warning' | 'neutral' | 'danger'; statusLabel: string; icon: ReactNode; iconTone: string }>>;
  return activity[role];
}
