import React, { createContext, useContext, useEffect, useMemo } from 'react';
import type { User, UserRole } from '@/types';
import { getApiBaseUrl, queryClient, trpc } from '@/lib/trpc';
import { isSupportedWebRole } from '@/lib/web-compatibility';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (role?: UserRole) => void;
  logout: () => Promise<void>;
  selectRole: (role: UserRole) => void;
  refresh: () => Promise<unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ServerUser = Partial<User> & { role?: string; lastSignedIn?: string | Date | null };

function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as ServerUser;
  const role = source.role;
  if (!source.id || !source.name || !source.email || !role || !isSupportedWebRole(role)) return null;
  return {
    id: Number(source.id),
    name: String(source.name),
    email: String(source.email),
    role,
    ...(source.centreId ? { centreId: Number(source.centreId) } : {}),
    ...(source.programme ? { programme: String(source.programme) } : {}),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const sessionQuery = trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 60_000 });
  const logoutMutation = trpc.auth.logout.useMutation();
  const user = useMemo(() => normalizeUser(sessionQuery.data), [sessionQuery.data]);

  useEffect(() => {
    if (sessionQuery.error) console.warn('[LearnPort] Session lookup failed', sessionQuery.error.message);
  }, [sessionQuery.error]);

  const login = (role?: UserRole) => {
    if (role) sessionStorage.setItem('learnport_requested_role', role);
    window.location.assign(`${getApiBaseUrl()}/api/oauth/login`);
  };

  const selectRole = (role: UserRole) => login(role);

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      queryClient.clear();
      sessionStorage.removeItem('learnport_requested_role');
      window.location.assign('/');
    }
  };

  return <AuthContext.Provider value={{ user, isLoading: sessionQuery.isLoading, error: sessionQuery.error?.message ?? null, login, logout, selectRole, refresh: sessionQuery.refetch }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
