import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

export const DEMO_TOUR_STORAGE_PREFIX = 'learnport.demo-tour.role.v2';

type DemoTourProps = {
  onOpenShortcuts: () => void;
  onOpenRoleSwitcher: () => void;
};

type DemoRoleKey = UserRole | 'student';
type TourStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  target: string;
  actionLabel?: string;
  route?: string;
  action?: 'shortcuts' | 'role-switcher';
};

type StepTemplate = Omit<TourStep, 'eyebrow'>;

const SHARED_STEPS: StepTemplate[] = [
  { id: 'workspace', title: 'Start in your workspace', body: 'Your LearnPort navigation and dashboard reflect the selected role. This demo workspace is safe to explore and does not alter connected accounts.', target: '.demo-role-switcher-button' },
  { id: 'shortcuts', title: 'Move quickly with shortcuts', body: 'Press 1–7 to switch demo roles, or use G then a destination key to navigate. Open the keyboard guide whenever you need a reminder.', target: '.shortcut-button', actionLabel: 'Open shortcut guide', action: 'shortcuts' },
  { id: 'role-switcher', title: 'Switch perspectives without signing out', body: 'The role menu keeps every seeded perspective close at hand. Try another role whenever you want to compare workflows.', target: '.demo-role-switcher-button', actionLabel: 'Open role menu', action: 'role-switcher' },
];

const ROLE_STEPS: Record<DemoRoleKey, StepTemplate[]> = {
  learner: [
    { id: 'portfolio', title: 'Build your learning portfolio', body: 'Review unit progress, recent evidence, and feedback actions from one portfolio view.', target: '.page-heading', actionLabel: 'Open portfolio', route: '/portfolio' },
    { id: 'evidence', title: 'Submit evidence for marking', body: 'Choose a unit and criterion, attach a PDF or image, and preview the complete learner submission flow.', target: '.surface-card', actionLabel: 'Open evidence upload', route: '/upload' },
    { id: 'learner-progress', title: 'Keep progress moving', body: 'Use the learner dashboard to see upcoming actions, notifications, and the next step for your qualification.', target: '.dashboard-grid', actionLabel: 'Return to learner overview', route: '/dashboard' },
  ],
  student: [
    { id: 'student-progress', title: 'See your coursework progress', body: 'The Student learner workspace presents prepared coursework, unit progress, and recent evidence in a clear starting point.', target: '.dashboard-grid', actionLabel: 'Open student overview', route: '/dashboard' },
    { id: 'student-portfolio', title: 'Organise coursework evidence', body: 'Open My portfolio to inspect units, submission history, and the actions that keep coursework moving toward completion.', target: '.page-heading', actionLabel: 'Open coursework portfolio', route: '/portfolio' },
    { id: 'student-upload', title: 'Prepare your next submission', body: 'Use Upload evidence to attach supporting files and connect them to the right unit and criterion before sending them for marking.', target: '.surface-card', actionLabel: 'Open submission workspace', route: '/upload' },
  ],
  trainer: [
    { id: 'sessions', title: 'Coordinate training sessions', body: 'Review upcoming sessions, attendance context, and delivery activity for your learner groups.', target: '.dashboard-grid', actionLabel: 'Open training sessions', route: '/dashboard?view=sessions' },
    { id: 'groups', title: 'Monitor learner groups', body: 'Use the learner-group view to follow progress and identify where training support is needed next.', target: '.page-heading', actionLabel: 'Open learner groups', route: '/dashboard?view=learners' },
    { id: 'trainer-overview', title: 'Use trends to plan support', body: 'Return to the Trainer overview to review prepared submission trends and turn them into practical delivery actions.', target: '.dashboard-grid', actionLabel: 'Return to trainer overview', route: '/dashboard' },
  ],
  assessor: [
    { id: 'marking', title: 'Work through the marking queue', body: 'Open a prepared submission, review criteria, and explore the feedback assistant before saving a demo decision.', target: '.page-heading', actionLabel: 'Open marking suite', route: '/marking' },
    { id: 'assessor-learners', title: 'Keep learner context close', body: 'The learner-group view gives you progress and activity context alongside the marking queue.', target: '.page-heading', actionLabel: 'Open learner groups', route: '/dashboard?view=learners' },
    { id: 'assessor-notifications', title: 'Stay on top of assessment updates', body: 'Notifications collect new submissions, feedback events, and quality requests that need your attention.', target: '.dashboard-grid', actionLabel: 'Open notifications', route: '/dashboard?view=notifications' },
  ],
  iqa: [
    { id: 'sampling', title: 'Review the sampling queue', body: 'Open prepared assessment samples and inspect the decisions selected for internal quality assurance.', target: '.page-heading', actionLabel: 'Open sampling queue', route: '/dashboard?view=sampling' },
    { id: 'iqa-reports', title: 'Track quality patterns', body: 'Use QA reports to turn sampling activity into standardisation actions and a clearer quality picture.', target: '.dashboard-grid', actionLabel: 'Open QA reports', route: '/dashboard?view=reports' },
    { id: 'iqa-notifications', title: 'Follow actions to completion', body: 'Use notifications to keep approvals, referrals, and centre-level quality updates visible.', target: '.dashboard-grid', actionLabel: 'Open notifications', route: '/dashboard?view=notifications' },
  ],
  eqa: [
    { id: 'external-sample', title: 'Inspect the external sample', body: 'Review prepared centre evidence and assessment decisions through the external quality workspace.', target: '.page-heading', actionLabel: 'Open external sample', route: '/dashboard?view=sampling' },
    { id: 'compliance', title: 'Prepare for compliance review', body: 'Open the compliance report to identify centre actions, evidence gaps, and the next review summary.', target: '.dashboard-grid', actionLabel: 'Open compliance report', route: '/dashboard?view=reports' },
    { id: 'eqa-notifications', title: 'Keep review updates visible', body: 'Notifications help you follow centre responses and newly available evidence without losing the audit trail.', target: '.dashboard-grid', actionLabel: 'Open notifications', route: '/dashboard?view=notifications' },
  ],
  admin: [
    { id: 'directory', title: 'Approve and manage identities', body: 'The administrator directory shows prepared users, account status, role assignments, and access scopes in one place.', target: '.admin-directory-card', actionLabel: 'Open user administration', route: '/dashboard?view=admin' },
    { id: 'audit', title: 'Compare workspace activity', body: 'Select roles in Role comparison to review their prepared audit trails side by side and spot activity patterns quickly.', target: '.role-comparison-card', actionLabel: 'Show role comparison', route: '/dashboard?view=admin' },
    { id: 'admin-audit', title: 'Filter the access audit log', body: 'Search by action or user, sort by date, and narrow the audit log when investigating a specific access change.', target: '.audit-workspace-card', actionLabel: 'Review audit log', route: '/dashboard?view=admin#audit' },
  ],
};

function storageKey(roleKey: DemoRoleKey) {
  return `${DEMO_TOUR_STORAGE_PREFIX}:${roleKey}`;
}

function hasCompletedTour(roleKey: DemoRoleKey) {
  try {
    return window.localStorage.getItem(storageKey(roleKey)) === 'true';
  } catch {
    return false;
  }
}

function completeTour(roleKey: DemoRoleKey) {
  try {
    window.localStorage.setItem(storageKey(roleKey), 'true');
  } catch {
    // The tour remains dismissible when browser storage is unavailable.
  }
}

function buildSteps(roleKey: DemoRoleKey) {
  const templates = [...SHARED_STEPS, ...ROLE_STEPS[roleKey]];
  return templates.map((step, index) => ({ ...step, eyebrow: `Step ${index + 1} of ${templates.length} · ${roleKey === 'student' ? 'Student learner' : roleKey[0].toUpperCase() + roleKey.slice(1)} tour` }));
}

export function DemoTour({ onOpenShortcuts, onOpenRoleSwitcher }: DemoTourProps) {
  const { isDemo, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const roleKey: DemoRoleKey = user?.role === 'learner' && user.id === 102 ? 'student' : (user?.role ?? 'learner');
  const steps = useMemo(() => buildSteps(roleKey), [roleKey]);
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isDemo) {
      setOpen(false);
      return;
    }
    setStepIndex(0);
    if (!hasCompletedTour(roleKey)) setOpen(true);
  }, [isDemo, roleKey]);

  useEffect(() => {
    if (!open) return;
    const target = document.querySelector(steps[stepIndex]?.target);
    target?.classList.add('demo-tour-target');
    return () => target?.classList.remove('demo-tour-target');
  }, [open, stepIndex, steps, location.pathname, location.search]);

  if (!open || !isDemo) return null;

  const step = steps[stepIndex];
  const finish = () => {
    completeTour(roleKey);
    setOpen(false);
  };
  const next = () => stepIndex === steps.length - 1 ? finish() : setStepIndex((index) => index + 1);
  const previous = () => setStepIndex((index) => Math.max(0, index - 1));
  const action = () => {
    if (step.action === 'shortcuts') onOpenShortcuts();
    if (step.action === 'role-switcher') onOpenRoleSwitcher();
    if (step.route) navigate(step.route);
    next();
  };

  return (
    <div className="demo-tour-layer" role="presentation">
      <div className="demo-tour-scrim" />
      <section className={`demo-tour-card demo-tour-card-${step.id}`} role="dialog" aria-modal="true" aria-labelledby="demo-tour-title" aria-describedby="demo-tour-body">
        <div className="demo-tour-progress" aria-label={`Tour step ${stepIndex + 1} of ${steps.length}`}>
          <span className="demo-tour-mark"><GraduationCap size={16} /></span>
          <span className="demo-tour-progress-track">{steps.map((item, index) => <span key={item.id} className={index <= stepIndex ? 'demo-tour-progress-dot demo-tour-progress-dot-active' : 'demo-tour-progress-dot'} />)}</span>
          <button className="icon-button" onClick={finish} aria-label="Skip guided tour"><X size={15} /></button>
        </div>
        <p className="eyebrow">{step.eyebrow}</p>
        <h2 id="demo-tour-title">{step.title}</h2>
        <p id="demo-tour-body">{step.body}</p>
        <div className="demo-tour-footer">
          <button className="button-ghost" onClick={finish}>Skip tour</button>
          <div className="demo-tour-actions">
            {stepIndex > 0 && <button className="button-secondary" onClick={previous}><ArrowLeft size={15} /> Back</button>}
            {step.actionLabel ? <button className="button-primary" onClick={action}>{step.actionLabel}<ArrowRight size={15} /></button> : <button className="button-primary" onClick={next}>{stepIndex === steps.length - 1 ? <><CheckCircle2 size={15} /> Finish tour</> : <>Continue <ArrowRight size={15} /></>}</button>}
          </div>
        </div>
      </section>
    </div>
  );
}
