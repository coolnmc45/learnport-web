import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Bell,
  BookOpen,
  ChevronDown,
  CheckSquare,
  ChevronRight,
  ClipboardCheck,
  FileUp,
  GraduationCap,
  Keyboard,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import { type DemoVariant } from '@/lib/demo-data';
import { useRealtimeNotifications } from '@/hooks/use-realtime-notifications';

const ROLE_META: Record<UserRole, { label: string; tone: string; short: string }> = {
  learner: { label: 'Learner', tone: 'role-learner', short: 'L' },
  assessor: { label: 'Assessor', tone: 'role-assessor', short: 'A' },
  trainer: { label: 'Trainer', tone: 'role-trainer', short: 'T' },
  iqa: { label: 'Internal Quality Assurer', tone: 'role-iqa', short: 'I' },
  eqa: { label: 'External Quality Assurer', tone: 'role-eqa', short: 'E' },
  admin: { label: 'Administrator', tone: 'role-admin', short: 'A' },
};

type NavItem = {
  label: string;
  to: string;
  icon: typeof LayoutDashboard;
  roles?: UserRole[];
};

const DEMO_ROLE_OPTIONS: Array<{ role: UserRole; variant: DemoVariant; label: string; description: string }> = [
  { role: 'learner', variant: 'learner', label: 'Learner', description: 'Aisha Rahman · portfolio and evidence' },
  { role: 'learner', variant: 'student', label: 'Student learner', description: 'Daniel Okafor · coursework and progress' },
  { role: 'trainer', variant: 'learner', label: 'Trainer', description: 'Sofia Bennett · sessions and resources' },
  { role: 'assessor', variant: 'learner', label: 'Assessor', description: 'Michael Chen · marking and feedback' },
  { role: 'iqa', variant: 'learner', label: 'IQA', description: 'Priya Shah · sampling and quality' },
  { role: 'eqa', variant: 'learner', label: 'EQA', description: 'James Wilson · compliance review' },
  { role: 'admin', variant: 'learner', label: 'Administrator', description: 'Helen Brooks · access and audit controls' },
];

const NAV_ITEMS: NavItem[] = [
  { label: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { label: 'My portfolio', to: '/portfolio', icon: BookOpen, roles: ['learner'] },
  { label: 'Upload evidence', to: '/upload', icon: FileUp, roles: ['learner'] },
  { label: 'Marking suite', to: '/marking', icon: CheckSquare, roles: ['assessor'] },
  { label: 'Learner groups', to: '/dashboard?view=learners', icon: Users, roles: ['assessor', 'trainer'] },
  { label: 'Training sessions', to: '/dashboard?view=sessions', icon: GraduationCap, roles: ['trainer'] },
  { label: 'Sampling queue', to: '/dashboard?view=sampling', icon: ClipboardCheck, roles: ['iqa', 'eqa'] },
  { label: 'User administration', to: '/dashboard?view=admin', icon: Users, roles: ['admin'] },
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
  const { user, logout, sessionExpired, reAuthenticate, isDemo, demoLogin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const realtime = useRealtimeNotifications(isDemo ? undefined : user?.id);
  const [toast, setToast] = useState<{ title: string; message: string } | null>(null);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);
  const [pendingShortcut, setPendingShortcut] = useState<string | null>(null);
  const chordTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!realtime.lastNotification) return;
    setToast({ title: realtime.lastNotification.title, message: realtime.lastNotification.message ?? 'Open LearnPort to view the latest update.' });
    const timer = window.setTimeout(() => setToast(null), 8000);
    return () => window.clearTimeout(timer);
  }, [realtime.lastNotification]);

  useEffect(() => {
    if (!user) return;
    const isTypingTarget = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
    const shortcutPaths: Record<string, string> = {
      d: '/dashboard',
      p: '/portfolio',
      m: '/marking',
      u: '/upload',
      n: '/dashboard?view=notifications',
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target)) return;
      const key = event.key.toLowerCase();
      if (isDemo && /^[1-7]$/.test(key)) {
        const option = DEMO_ROLE_OPTIONS[Number(key) - 1];
        if (option) {
          event.preventDefault();
          demoLogin(option.role, option.variant);
          setRoleSwitcherOpen(false);
          setProfileOpen(false);
          setToast({ title: `${option.label} demo workspace`, message: 'Workspace switched without signing out.' });
          navigate('/dashboard');
        }
        return;
      }
      if (key === '?' || (event.key === '/' && event.shiftKey)) {
        event.preventDefault();
        setShortcutsOpen((open) => !open);
        setPendingShortcut(null);
        return;
      }
      if (key === 'escape') {
        setShortcutsOpen(false);
        setProfileOpen(false);
        setRoleSwitcherOpen(false);
        setPendingShortcut(null);
        return;
      }
      if (key === 'b') {
        event.preventDefault();
        setCollapsed((value) => !value);
        return;
      }
      if (pendingShortcut === 'g') {
        event.preventDefault();
        setPendingShortcut(null);
        const destination = shortcutPaths[key];
        if (destination) navigate(destination);
        return;
      }
      if (key === 'g') {
        event.preventDefault();
        setPendingShortcut('g');
        if (chordTimer.current) window.clearTimeout(chordTimer.current);
        chordTimer.current = window.setTimeout(() => setPendingShortcut(null), 1_200);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      if (chordTimer.current) window.clearTimeout(chordTimer.current);
    };
  }, [demoLogin, isDemo, navigate, pendingShortcut, user]);

  if (!user) return <>{children}</>;

  const role = ROLE_META[user.role];
  const items = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));
  const currentPath = location.pathname;
  const isActive = (to: string) => currentPath === to || (to !== '/dashboard' && currentPath.startsWith(to));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const switchDemoRole = (option: (typeof DEMO_ROLE_OPTIONS)[number]) => {
    if (!isDemo) return;
    demoLogin(option.role, option.variant);
    setRoleSwitcherOpen(false);
    setProfileOpen(false);
    navigate('/dashboard');
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

        <button type="button" className={`sidebar-profile-card ${profileOpen ? 'sidebar-profile-card-open' : ''}`} onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen} title={collapsed ? `${user.name}, ${role.label}` : undefined}>
          <span className="profile-avatar">{initials(user.name)}</span>
          {!collapsed && <span className="sidebar-profile-copy"><strong>{user.name}</strong><small>{role.label}{isDemo ? ' · Demo' : ''}</small><small>{user.email}</small></span>}
          {!collapsed && <UserCircle size={16} className="sidebar-profile-icon" />}
        </button>
        {profileOpen && !collapsed && <div className="sidebar-profile-popover" role="dialog" aria-label="Current user profile"><strong>{role.label}{isDemo ? ' · Demo workspace' : ''}</strong><span>{user.email}</span><span>{user.programme ?? 'Quality workspace'}</span><span>{user.centreId ? `Centre ${user.centreId}` : 'Centre not assigned'}</span></div>}

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
                {!collapsed && item.label === 'Notifications' && realtime.unreadCount > 0 && <span className="notification-count">{realtime.unreadCount > 99 ? '99+' : realtime.unreadCount}</span>}
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
            <button className="icon-button shortcut-button" onClick={() => setShortcutsOpen(true)} aria-label="Show keyboard shortcuts" title="Keyboard shortcuts (?)"><Keyboard size={17} /></button>
            {isDemo && <div className="demo-role-switcher">
              <button type="button" className="demo-role-switcher-button" onClick={() => setRoleSwitcherOpen((open) => !open)} aria-expanded={roleSwitcherOpen} aria-haspopup="menu">
                <span className="demo-role-switcher-label">Demo role</span><strong>{role.label}</strong><ChevronDown size={15} className={roleSwitcherOpen ? 'demo-role-switcher-chevron-open' : ''} />
              </button>
              {roleSwitcherOpen && <div className="demo-role-switcher-menu" role="menu" aria-label="Switch demo role">
                <div className="demo-role-switcher-heading">Switch workspace</div>
                {DEMO_ROLE_OPTIONS.map((option) => <button key={`${option.role}-${option.variant}`} type="button" role="menuitem" className={`demo-role-option ${option.role === user.role && ((option.variant === 'student') === (user.id === 102)) ? 'demo-role-option-active' : ''}`} onClick={() => switchDemoRole(option)}><span className={`role-avatar ${ROLE_META[option.role].tone}`}>{ROLE_META[option.role].short}</span><span><strong>{option.label}</strong><small>{option.description}</small></span></button>)}
              </div>}
            </div>}
            <button className="notification-button" onClick={() => navigate('/dashboard?view=notifications')} aria-label="View notifications">
              <Bell size={18} />
              {realtime.unreadCount > 0 && <span className="notification-dot" aria-label={`${realtime.unreadCount} unread notifications`} />}
              <span className="sr-only">Notifications are {realtime.status}</span>
            </button>
            <div className="profile-chip">
              <span className="profile-avatar">{initials(user.name)}</span>
              <span className="profile-chip-copy"><strong>{user.name}</strong><small>{isDemo ? `${role.label} · Demo workspace` : user.email}</small></span>
            </div>
          </div>
        </header>
        <main className="page-content">
          {sessionExpired && <div className="session-expiry-banner" role="alert"><AlertTriangle size={18} /><div><strong>Your session has expired</strong><span>Your workspace is still visible, but changes are paused until you sign in again.</span></div><button className="button-primary" onClick={reAuthenticate}>Sign in again</button><button className="icon-button" onClick={() => void logout()} aria-label="Sign out"><X size={15} /></button></div>}
          {pendingShortcut && <div className="shortcut-pending" role="status">Press a second key after <strong>G</strong> to navigate.</div>}
          {toast && <div className="live-toast" role="status"><strong>{toast.title}</strong><span>{toast.message}</span><button className="icon-button" onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={15} /></button></div>}
          {children}
        </main>
        {shortcutsOpen && <div className="modal-backdrop shortcut-backdrop" role="presentation" onClick={() => setShortcutsOpen(false)}><section className="shortcut-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-title" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">Desktop navigation</p><h3 id="shortcut-title">Keyboard shortcuts</h3><p>Use quick keys to move around LearnPort without leaving the keyboard.</p></div><button className="icon-button" onClick={() => setShortcutsOpen(false)} aria-label="Close keyboard shortcuts"><X size={16} /></button></div><div className="shortcut-list"><div><kbd>G</kbd><span>then</span><kbd>D</kbd><strong>Dashboard</strong></div><div><kbd>G</kbd><span>then</span><kbd>P</kbd><strong>Portfolio</strong></div><div><kbd>G</kbd><span>then</span><kbd>M</kbd><strong>Marking suite</strong></div><div><kbd>G</kbd><span>then</span><kbd>U</kbd><strong>Upload evidence</strong></div><div><kbd>G</kbd><span>then</span><kbd>N</kbd><strong>Notifications</strong></div><div><kbd>B</kbd><strong>Toggle sidebar</strong></div><div><kbd>?</kbd><strong>Show or hide this panel</strong></div><div><kbd>Esc</kbd><strong>Close dialogs</strong></div>{isDemo && <><div><kbd>1–7</kbd><strong>Switch demo workspace</strong></div><p className="shortcut-note">Number keys map to the roles in the demo role menu, from Learner through Administrator.</p></>}</div></section></div>}
      </div>
    </div>
  );
}

export { ROLE_META };
