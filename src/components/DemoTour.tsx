import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, GraduationCap, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const DEMO_TOUR_STORAGE_KEY = 'learnport.demo-tour.completed';

type DemoTourProps = {
  onOpenShortcuts: () => void;
  onOpenRoleSwitcher: () => void;
};

type TourStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  target: string;
  actionLabel?: string;
};

const TOUR_STEPS: TourStep[] = [
  {
    id: 'workspace',
    eyebrow: 'Step 1 of 5 · Demo workspace',
    title: 'Meet your current workspace',
    body: 'LearnPort changes the navigation and dashboard around the selected role. This demo workspace is safe to explore and does not alter connected accounts.',
    target: '.demo-role-switcher-button',
  },
  {
    id: 'shortcuts',
    eyebrow: 'Step 2 of 5 · Keyboard control',
    title: 'Move quickly with shortcuts',
    body: 'Press 1–7 to switch demo roles, or use G then a destination key to navigate. Open the keyboard guide whenever you need a reminder.',
    target: '.shortcut-button',
    actionLabel: 'Open shortcut guide',
  },
  {
    id: 'role-switcher',
    eyebrow: 'Step 3 of 5 · Role switcher',
    title: 'Try a different role',
    body: 'The role menu keeps all seeded perspectives close at hand. Switching preserves the demo session, so you can compare each workflow without signing out.',
    target: '.demo-role-switcher-button',
    actionLabel: 'Open role menu',
  },
  {
    id: 'administrator',
    eyebrow: 'Step 4 of 5 · Administrator view',
    title: 'Open the comparison workspace',
    body: 'The Administrator view brings access control and audit review together. We can open it for you now to show the cross-workspace comparison.',
    target: '.demo-role-switcher-button',
    actionLabel: 'Open Administrator view',
  },
  {
    id: 'comparison',
    eyebrow: 'Step 5 of 5 · Audit comparison',
    title: 'Compare audit trails side by side',
    body: 'Select the roles you want to inspect. Each card shows activity connected to that workspace, making it easier to spot approvals, sampling, compliance, and training actions.',
    target: '.role-comparison-card',
  },
];

function hasCompletedTour() {
  try {
    return window.localStorage.getItem(DEMO_TOUR_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function completeTour() {
  try {
    window.localStorage.setItem(DEMO_TOUR_STORAGE_KEY, 'true');
  } catch {
    // The tour remains dismissible if browser storage is unavailable.
  }
}

export function DemoTour({ onOpenShortcuts, onOpenRoleSwitcher }: DemoTourProps) {
  const { isDemo, demoLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isDemo) {
      setOpen(false);
      return;
    }
    if (!hasCompletedTour()) setOpen(true);
  }, [isDemo]);

  useEffect(() => {
    if (!open) return;
    const target = document.querySelector(TOUR_STEPS[stepIndex].target);
    target?.classList.add('demo-tour-target');
    return () => target?.classList.remove('demo-tour-target');
  }, [open, stepIndex, location.pathname, location.search]);

  if (!open || !isDemo) return null;

  const step = TOUR_STEPS[stepIndex];
  const finish = () => {
    completeTour();
    setOpen(false);
  };
  const next = () => {
    if (stepIndex === TOUR_STEPS.length - 1) {
      finish();
      return;
    }
    setStepIndex((index) => index + 1);
  };
  const previous = () => setStepIndex((index) => Math.max(0, index - 1));
  const action = () => {
    if (step.id === 'shortcuts') {
      onOpenShortcuts();
      next();
      return;
    }
    if (step.id === 'role-switcher') {
      onOpenRoleSwitcher();
      next();
      return;
    }
    if (step.id === 'administrator') {
      demoLogin('admin', 'learner');
      navigate('/dashboard?view=admin');
      next();
      return;
    }
    next();
  };

  return (
    <div className="demo-tour-layer" role="presentation">
      <div className="demo-tour-scrim" />
      <section className={`demo-tour-card demo-tour-card-${step.id}`} role="dialog" aria-modal="true" aria-labelledby="demo-tour-title" aria-describedby="demo-tour-body">
        <div className="demo-tour-progress" aria-label={`Tour step ${stepIndex + 1} of ${TOUR_STEPS.length}`}>
          <span className="demo-tour-mark"><GraduationCap size={16} /></span>
          <span className="demo-tour-progress-track">{TOUR_STEPS.map((item, index) => <span key={item.id} className={index <= stepIndex ? 'demo-tour-progress-dot demo-tour-progress-dot-active' : 'demo-tour-progress-dot'} />)}</span>
          <button className="icon-button" onClick={finish} aria-label="Skip guided tour"><X size={15} /></button>
        </div>
        <p className="eyebrow">{step.eyebrow}</p>
        <h2 id="demo-tour-title">{step.title}</h2>
        <p id="demo-tour-body">{step.body}</p>
        <div className="demo-tour-footer">
          <button className="button-ghost" onClick={finish}>Skip tour</button>
          <div className="demo-tour-actions">
            {stepIndex > 0 && <button className="button-secondary" onClick={previous}><ArrowLeft size={15} /> Back</button>}
            {step.actionLabel ? <button className="button-primary" onClick={action}>{step.actionLabel}<ArrowRight size={15} /></button> : <button className="button-primary" onClick={next}>{stepIndex === TOUR_STEPS.length - 1 ? <><CheckCircle2 size={15} /> Finish tour</> : <>Continue <ArrowRight size={15} /></>}</button>}
          </div>
        </div>
      </section>
    </div>
  );
}
