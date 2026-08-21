import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { buildOAuthLoginUrl, SESSION_CHECK_TIMEOUT_MS } from './lib/auth-url';
import { isSupportedWebRole, ROLE_WORKSPACE_PATHS, WEB_ROLES } from './lib/web-compatibility';
import { sortRows, toggleSort } from './lib/table-utils';

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

  it('sorts table rows predictably in both directions', () => {
    const rows = [{ name: 'Zoe' }, { name: 'Ada' }, { name: 'Mina' }];
    expect(sortRows(rows, (row) => row.name).map((row) => row.name)).toEqual(['Ada', 'Mina', 'Zoe']);
    expect(sortRows(rows, (row) => row.name, 'desc').map((row) => row.name)).toEqual(['Zoe', 'Mina', 'Ada']);
    expect(toggleSort('name', 'name', 'asc')).toBe('desc');
    expect(toggleSort('name', 'role', 'desc')).toBe('asc');
  });
});
