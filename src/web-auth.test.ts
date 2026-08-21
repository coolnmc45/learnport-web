import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildOAuthLoginUrl, SESSION_CHECK_TIMEOUT_MS } from './lib/auth-url';
import { isSupportedWebRole, ROLE_WORKSPACE_PATHS, WEB_ROLES } from './lib/web-compatibility';
import { sortRows, toggleSort } from './lib/table-utils';
import { DEMO_USERS, DEMO_UNITS, DEMO_SUBMISSIONS, DEMO_MARKINGS, DEMO_SESSIONS, DEMO_IQA_SAMPLES, DEMO_COMPLIANCE, demoUserFor } from './lib/demo-data';

const root = process.cwd();

function readSource(relativePath: string) {
  return fs.readFileSync(path.join(root, 'src', relativePath), 'utf8');
}

describe('LearnPort web authentication regression coverage', () => {
  it('preserves the initiating desktop host through the OAuth round trip', () => {
    const currentUrl = 'https://coolnmc45.github.io/learnport-web/#/';
    const loginUrl = buildOAuthLoginUrl('https://learnport-h3kw3ebv.manus.space', currentUrl);
    const parsed = new URL(loginUrl);

    expect(parsed.origin).toBe('https://learnport-h3kw3ebv.manus.space');
    expect(parsed.pathname).toBe('/api/oauth/login');
    expect(parsed.searchParams.get('returnTo')).toBe(currentUrl);
  });

  it('uses a bounded session check and exposes retry recovery', () => {
    expect(SESSION_CHECK_TIMEOUT_MS).toBeGreaterThanOrEqual(5_000);
    expect(SESSION_CHECK_TIMEOUT_MS).toBeLessThanOrEqual(15_000);

    const auth = readSource('contexts/AuthContext.tsx');
    const landing = readSource('pages/RoleSelect.tsx');
    expect(auth).toContain('sessionTimedOut');
    expect(auth).toContain('window.setTimeout');
    expect(auth).toContain('buildOAuthLoginUrl');
    expect(landing).toContain('Try again');
  });

  it('keeps all six roles on protected dashboard workspaces', () => {
    expect(WEB_ROLES).toEqual(['learner', 'assessor', 'trainer', 'iqa', 'eqa', 'admin']);
    for (const role of WEB_ROLES) {
      expect(isSupportedWebRole(role)).toBe(true);
      expect(ROLE_WORKSPACE_PATHS[role]).toContain('/dashboard');
    }

    const routes = readSource('App.tsx');
    expect(routes).toContain('user.accountStatus === \'active\' ? \'/dashboard\' : \'/account-status\'');
    expect(routes).toContain('<ProtectedRoute><Dashboard /></ProtectedRoute>');
  });

  it('keeps the desktop navigation persistent and the workspace content wide', () => {
    const shell = readSource('components/AppShell.tsx');
    const styles = readSource('index.css');
    expect(shell).toContain('className="sidebar');
    expect(shell).toContain('Collapse menu');
    expect(styles).toContain('.sidebar { position: fixed');
    expect(styles).toContain('.topbar { position: sticky');
    expect(styles).toContain('.data-table { min-width: 760px; }');
  });

  it('exposes keyboard navigation and a clear session-expiry recovery path', () => {
    const shell = readSource('components/AppShell.tsx');
    const auth = readSource('contexts/AuthContext.tsx');
    expect(shell).toContain("shortcutPaths");
    expect(shell).toContain("Press a second key after");
    expect(shell).toContain("Your session has expired");
    expect(shell).toContain("Sign in again");
    expect(auth).toContain('sessionExpired');
    expect(auth).toContain('reAuthenticate');
    expect(auth).toContain('DEMO_SESSION_KEY');
    expect(auth).toContain('window.localStorage.removeItem(DEMO_SESSION_KEY)');
  });

  it('provides profile details and sortable/filterable administrator data surfaces', () => {
    const shell = readSource('components/AppShell.tsx');
    const admin = readSource('components/AdminControlPlane.tsx');
    expect(shell).toContain('sidebar-profile-card');
    expect(shell).toContain('user.email');
    expect(admin).toContain('Filter users by role');
    expect(admin).toContain('table-sort-button');
    expect(admin).toContain('auditSortDirection');
  });

  it('provides a working demo identity for every supported workspace', () => {
    const landing = readSource('pages/RoleSelect.tsx');
    expect(landing).toContain('Try demo');
    expect(landing).toContain('Student learner');
    expect(landing).toContain('Administrator');
    for (const role of WEB_ROLES) {
      const user = demoUserFor(role);
      expect(user.role).toBe(role);
      expect(user.accountStatus).toBe('active');
      expect(user.id).toBeGreaterThan(0);
    }
    expect(demoUserFor('learner', 'student').id).toBe(102);
    expect(readSource('contexts/AuthContext.tsx')).toContain('demoLogin');
  });

  it('contains prepared records for the core platform workflows', () => {
    expect(DEMO_USERS).toHaveLength(7);
    expect(DEMO_UNITS.length).toBeGreaterThanOrEqual(4);
    expect(DEMO_SUBMISSIONS.length).toBeGreaterThanOrEqual(5);
    expect(DEMO_MARKINGS.length).toBeGreaterThanOrEqual(2);
    expect(DEMO_SESSIONS.length).toBeGreaterThanOrEqual(3);
    expect(DEMO_IQA_SAMPLES.length).toBeGreaterThanOrEqual(2);
    expect(DEMO_COMPLIANCE.length).toBeGreaterThanOrEqual(4);
    expect(DEMO_SUBMISSIONS.some((submission) => submission.status === 'passed')).toBe(true);
    expect(DEMO_SUBMISSIONS.some((submission) => submission.status === 'referred')).toBe(true);
  });

  it('provides a demo-only quick switch for every seeded workspace', () => {
    const shell = readSource('components/AppShell.tsx');
    expect(shell).toContain('DEMO_ROLE_OPTIONS');
    expect(shell).toContain('demo-role-switcher-menu');
    expect(shell).toContain('switchDemoRole');
    expect(shell).toContain("variant: 'student'");
    for (const role of WEB_ROLES) expect(shell).toContain(`role: '${role}'`);
  });

  it('shows a clear animated transition for keyboard role switches', () => {
    const shell = readSource('components/AppShell.tsx');
    const styles = readSource('index.css');
    expect(shell).toContain('roleSwitching');
    expect(shell).toContain('showRoleSwitching');
    expect(shell).toContain('Loading the demo workspace');
    expect(styles).toContain('@keyframes role-switch-in');
    expect(styles).toContain('prefers-reduced-motion');
  });

  it('provides cross-workspace audit role comparison controls', () => {
    const admin = readSource('components/AdminControlPlane.tsx');
    const styles = readSource('index.css');
    expect(admin).toContain('comparisonRoles');
    expect(admin).toContain('toggleComparisonRole');
    expect(admin).toContain('role-comparison-grid');
    expect(admin).toContain('Roles included in audit comparison');
    expect(styles).toContain('.role-comparison-grid');
    expect(styles).toContain('.comparison-role-toggle-active');
  });

  it('provides a dismissible first-use guided demo tour', () => {
    const tour = readSource('components/DemoTour.tsx');
    const shell = readSource('components/AppShell.tsx');
    const styles = readSource('index.css');
    expect(tour).toContain("DEMO_TOUR_STORAGE_KEY = 'learnport.demo-tour.completed'");
    expect(tour).toContain('Step 1 of 5');
    expect(tour).toContain('Step 5 of 5');
    expect(tour).toContain('Skip tour');
    expect(tour).toContain('localStorage.setItem');
    expect(tour).toContain("navigate('/dashboard?view=admin')");
    expect(shell).toContain('<DemoTour');
    expect(styles).toContain('.demo-tour-layer');
    expect(styles).toContain('demo-tour-target');
  });

  it('sorts table rows predictably in both directions', () => {
    const rows = [{ name: 'Zoe' }, { name: 'Ada' }, { name: 'Mina' }];
    expect(sortRows(rows, (row) => row.name).map((row) => row.name)).toEqual(['Ada', 'Mina', 'Zoe']);
    expect(sortRows(rows, (row) => row.name, 'desc').map((row) => row.name)).toEqual(['Zoe', 'Mina', 'Ada']);
    expect(toggleSort('name', 'name', 'asc')).toBe('desc');
    expect(toggleSort('name', 'role', 'desc')).toBe('asc');
  });
});
