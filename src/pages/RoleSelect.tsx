import { BookOpen, CheckSquare, ClipboardCheck, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

const roles: Array<{ role: UserRole; title: string; description: string; icon: typeof BookOpen; tone: string }> = [
  { role: 'learner', title: 'Learner', description: 'Build your portfolio and submit evidence.', icon: BookOpen, tone: 'role-learner' },
  { role: 'assessor', title: 'Assessor', description: 'Mark work and give constructive feedback.', icon: CheckSquare, tone: 'role-assessor' },
  { role: 'trainer', title: 'Trainer', description: 'Coordinate sessions and learning resources.', icon: GraduationCap, tone: 'role-trainer' },
  { role: 'iqa', title: 'IQA', description: 'Sample decisions and support consistency.', icon: ClipboardCheck, tone: 'role-iqa' },
  { role: 'eqa', title: 'EQA', description: 'Review centre standards and compliance.', icon: ShieldCheck, tone: 'role-eqa' },
];

export function RoleSelect() {
  const { selectRole, error, refresh } = useAuth();

  return <div className="role-select-page">
    <section className="role-select-hero"><div><div className="brand-lockup"><span className="brand-mark"><GraduationCap size={20} /></span><span><strong>LearnPort</strong><small>Learning portfolio</small></span></div><h1>Evidence-led learning, all in one place.</h1><p>Bring learners, assessors, trainers and quality teams together with a clear portfolio and assessment workspace.</p><div className="hero-proof"><span>Portfolio tracking</span><span>AI-assisted feedback</span><span>Quality assurance</span></div></div><small style={{ color: '#99bdd0', fontSize: 11 }}>A connected workspace for every stage of learning delivery.</small></section>
    <section className="role-select-main"><div className="role-select-card"><div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 12, color: '#1c8b83', fontSize: 11, fontWeight: 800, letterSpacing: '.1em', textTransform: 'uppercase' }}><Sparkles size={15} /> Secure sign in</div><h2>Choose your workspace</h2><p>Select the area you work in, then sign in securely. LearnPort loads your assigned role, portfolio records and permissions from the connected database.</p><div className="role-options">{roles.map(({ role, title, description, icon: Icon, tone }) => <button key={role} className="role-option" onClick={() => selectRole(role)}><span className={`role-option-icon ${tone}`}><Icon size={17} /></span><span><strong>{title}</strong><small>{description}</small></span><span style={{ marginLeft: 'auto', color: '#93a3b3', fontSize: 18 }}>›</span></button>)}</div>{error && <div className="notice warning-notice auth-recovery-notice" style={{ marginTop: 14 }}><span>{error}</span><button className="button-secondary" onClick={() => void refresh()}>Try again</button></div>}<div className="login-divider">Connected workspace</div><div className="demo-note"><ShieldCheck size={15} /><span>There is no demo data in the connected experience. Your dashboard, submissions, feedback and evidence are loaded from LearnPort’s authenticated services.</span></div></div></section>
  </div>;
}
