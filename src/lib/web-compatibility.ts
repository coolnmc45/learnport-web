import type { UserRole } from '@/types';

export const WEB_ROLES: readonly UserRole[] = ['learner', 'assessor', 'trainer', 'iqa', 'eqa'];

export const ROLE_WORKSPACE_PATHS: Record<UserRole, string[]> = {
  learner: ['/dashboard', '/portfolio', '/upload'],
  assessor: ['/dashboard', '/marking'],
  trainer: ['/dashboard'],
  iqa: ['/dashboard'],
  eqa: ['/dashboard'],
};

export function isSupportedWebRole(role: string): role is UserRole {
  return WEB_ROLES.includes(role as UserRole);
}

export function isEvidenceFileAllowed(file: Pick<File, 'type' | 'size'>, maxBytes = 50 * 1024 * 1024) {
  const supportedType = file.type === 'application/pdf' || file.type.startsWith('image/');
  return supportedType && file.size <= maxBytes;
}
