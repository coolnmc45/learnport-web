import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  BookOpen,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  FileUp,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

const ROLE_META: Record<UserRole, { label: string; tone: string; short: string }> = {
  learner: { label: 'Learner', tone: 'role-learner', short: 'L' },
  assessor: { label: 'Assessor', tone: 'role-assessor', short: 'A' },
  trainer: { label: 'Trainer', tone: 'role-trainer', short: 'T' },
  iqa: { label: 'Internal Quality Assurer', tone: 'role-iqa', short: 'I' },
  eqa: { label: 'External Quality Assurer', tone: 'role-eqa', short: 'E' },
};

type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My portfolio', to: '/portfolio', icon: BookOpen, roles: ['learner'] },
  { label: 'Upload evidence', to: '/upload', icon: FileUp, roles: ['learner'] },
  { label: 'Marking suite', to: '/marking', icon: CheckSquare, roles: ['assessor'] },
  { label: 'Learner groups', to: '/dashboard?view=learners', icon: Users, roles: ['assessor', 'trainer'] },
  { label: 'Training sessions', to: '/dashboard?view=sessions', icon: GraduationCap, roles: ['trainer'] },
  { label: 'Sampling queue', to: '/dashboard?view=sampling', icon: ClipboardCheck, roles: ['iqa', 'eqa'] },
  { label: 'Notifications', to: '/dashboard?view=notifications', icon: Bell },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return <>{children}</>;

  const role = ROLE_META[user.role];
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));
  const currentPath = location.pathname;
  const isActive = (to: string) => currentPath === to || (to !== '/dashboard' && currentPath.startsWith(to));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${mobileOpen ? 'sidebar-mobile-open' : ''}`}>
        <div className="sidebar-topline">
          <Link to="/dashboard" className="brand-lockup" onClick={() => setMobileOpen(false)} aria-label="LearnPort overview">
            <span className="brand-mark"><GraduationCap size={20} strokeWidth={2.4} /></span>
            {!collapsed && <span><strong>LearnPort</strong><small>Learning portfolio</small></span>}
          </Link>
          <button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={18} /></button>
        </div>

        <div className="sidebar-role-card">
          <span className={`role-avatar ${role.tone}`}>{role.short}</span>
          {!collapsed && <span><strong>{role.label}</strong><small>{user.programme ?? 'Quality workspace'}</small></span>}
        </div>

        <nav className="sidebar-nav" aria-label="Primary navigation">
          {!collapsed && <p className="nav-heading">Workspace</p>}
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`nav-item ${isActive(item.to) ? 'nav-item-active' : ''}`}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && isActive(item.to) && <ChevronRight size={15} className="nav-chevron" />}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item" onClick={() => window.alert('Settings are available in the full connected deployment.')} title={collapsed ? 'Settings' : undefined}>
            <Settings size={18} />
            {!collapsed && <span>Settings</span>}
          </button>
          <button className="nav-item nav-item-danger" onClick={handleLogout} title={collapsed ? 'Sign out' : undefined}>
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>

        <button className="sidebar-collapse-toggle" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}>
          {collapsed ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
          {!collapsed && <span>Collapse menu</span>}
        </button>
      </aside>

      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}

      <div className="app-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={20} /></button>
            <div>
              <p className="eyebrow">{role.label} workspace</p>
              <h1>Good morning, {user.name.split(' ')[0]}</h1>
            </div>
          </div>
          <div className="topbar-actions">
            <button className="notification-button" onClick={() => navigate('/dashboard?view=notifications')} aria-label="View notifications">
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            <div className="profile-chip">
              <span className="profile-avatar">{initials(user.name)}</span>
              <span className="profile-chip-copy"><strong>{user.name}</strong><small>{user.email}</small></span>
            </div>
          </div>
        </header>
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

export { ROLE_META };
