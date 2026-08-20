import { describe, expect, it } from 'vitest';
import { isEvidenceFileAllowed, isSupportedWebRole, ROLE_WORKSPACE_PATHS, WEB_ROLES } from './lib/web-compatibility';

function file(type: string, size: number) {
  return { type, size };
}

describe('LearnPort web compatibility', () => {
  it('supports all five role workspaces', () => {
    expect(WEB_ROLES).toEqual(['learner', 'assessor', 'trainer', 'iqa', 'eqa']);
    expect(WEB_ROLES.every((role) => ROLE_WORKSPACE_PATHS[role].includes('/dashboard'))).toBe(true);
    expect(ROLE_WORKSPACE_PATHS.learner).toEqual(['/dashboard', '/portfolio', '/upload']);
    expect(ROLE_WORKSPACE_PATHS.assessor).toContain('/marking');
  });

  it('recognises only supported roles', () => {
    expect(isSupportedWebRole('learner')).toBe(true);
    expect(isSupportedWebRole('assessor')).toBe(true);
    expect(isSupportedWebRole('administrator')).toBe(false);
    expect(isSupportedWebRole('')).toBe(false);
  });

  it('accepts PDF and image evidence within the size limit', () => {
    expect(isEvidenceFileAllowed(file('application/pdf', 1024))).toBe(true);
    expect(isEvidenceFileAllowed(file('image/png', 2048))).toBe(true);
    expect(isEvidenceFileAllowed(file('application/pdf', 50 * 1024 * 1024))).toBe(true);
  });

  it('rejects unsupported or oversized evidence', () => {
    expect(isEvidenceFileAllowed(file('text/plain', 1024))).toBe(false);
    expect(isEvidenceFileAllowed(file('application/zip', 1024))).toBe(false);
    expect(isEvidenceFileAllowed(file('image/jpeg', 50 * 1024 * 1024 + 1))).toBe(false);
  });
});
