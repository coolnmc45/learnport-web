import { BookOpen, CheckSquare, ClipboardCheck, GraduationCap, ShieldCheck, Sparkles, UserRound, UsersRound } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import type { DemoVariant } from '@/lib/demo-data';

const roles: Array<{ role: UserRole; variant?: DemoVariant; title: string; description: string; icon: typeof BookOpen; tone: string }> = [
  { role: 'learner', title: 'Learner', description: 'Build a portfolio, upload evidence and track progress.', icon: BookOpen, tone: 'role-learner' },
  { role: 'learner', variant: 'student', title: 'Student learner', description: 'Explore the student view with assignments and feedback.', icon: UserRound, tone: 'role-learner' },
  { role: 'trainer', title: 'Trainer', description: 'Coordinate sessions and share learning resources.', icon: GraduationCap, tone: 'role-trainer' },
  { role: 'assessor', title: 'Assessor', description: 'Mark work and give constructive feedback.', icon: CheckSquare, tone: 'role-assessor' },
  { role: 'iqa', title: 'IQA', description: 'Sample decisions and support assessment consistency.', icon: ClipboardCheck, tone: 'role-iqa' },
  { role: 'eqa', title: 'EQA', description: 'Review centre standards and compliance evidence.', icon: ShieldCheck, tone: 'role-eqa' },
  { role: 'admin', title: 'Administrator', description: 'Approve users, manage access and review the audit trail.', icon: UsersRound, tone: 'role-admin' },
];

export function RoleSelect() {
  const { selectRole, demoLogin, error, refresh } = useAuth();

  return <div className="role-select-page">
    <section className="role-select-hero"><div><div className="brand-lockup"><span className="brand-mark"><GraduationCap size={20} /></span><span><strong>LearnPort</strong><small>Learning portfolio</small></span></div><h1>Evidence-led learning, all in one place.</h1><p>Explore a realistic connected workspace for learners, trainers, assessors and quality teams.</p><div className="hero-proof"><span>Portfolio tracking</span><span>AI-assisted feedback</span><span>Quality assurance</span></div></div><small style={{ color: '#99bdd0', fontSize: 11 }}>Demo workspaces are ready for guided product reviews.</small></section>
    <section className="role-select-main"><div className="role-select-card"><div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12, color: '#1c8b83', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}><Sparkles size={15} /> LearnPort access</div><h2>Choose a workspace</h2><p>Use <strong>Try demo</strong> to explore the platform immediately with prepared records. Use <strong>Secure sign in</strong> when your organisation’s OAuth account and administrator approval are ready.</p><div className="role-options">{roles.map(({ role, variant, title, description, icon: Icon, tone }) => <div key={`${role}-${variant ?? 'primary'}`} className="role-option role-option-with-actions"><span className={`role-option-icon ${tone}`}><Icon size={17} /></span><span className="role-option-copy"><strong>{title}</strong><small>{description}</small></span><span className="role-option-actions"><button type="button" className="button-quiet" onClick={() => demoLogin(role, variant)}>Try demo</button><button type="button" className="icon-button role-live-login" onClick={() => selectRole(role)} aria-label={`Secure sign in as ${title}`} title="Secure sign in">›</button></span></div>)}</div>{error && <div className="notice warning-notice auth-recovery-notice" style={{ marginTop: 14 }}><span>{error}</span><button className="button-secondary" onClick={() => void refresh()}>Try again</button></div>}<div className="login-divider">What demo access includes</div><div className="demo-note"><ShieldCheck size={15} /><span>Demo workspaces use local browser session data only. They show portfolio evidence, marking queues, training sessions, notifications, quality records and administrator audit examples without changing the connected database.</span></div></div></section>
  </div>;
}
