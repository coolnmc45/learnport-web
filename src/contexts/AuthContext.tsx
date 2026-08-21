import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { User, UserRole } from '@/types';
import { getApiBaseUrl, queryClient, trpc } from '@/lib/trpc';
import { isSupportedWebRole } from '@/lib/web-compatibility';
import { buildOAuthLoginUrl, SESSION_CHECK_TIMEOUT_MS } from '@/lib/auth-url';
import { demoUserFor, type DemoVariant } from '@/lib/demo-data';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (role?: UserRole) => void;
  logout: () => Promise<void>;
  selectRole: (role: UserRole) => void;
  demoLogin: (role: UserRole, variant?: DemoVariant) => void;
  refresh: () => Promise<unknown>;
  isDemo: boolean;
  sessionExpired: boolean;
  reAuthenticate: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type ServerUser = Partial<User> & { id?: number | string; openId?: string | null; role?: string; accountStatus?: string | null; lastSignedIn?: string | Date | null };

function normalizeUser(value: unknown): User | null {
  if (!value || typeof value !== 'object') return null;
  const source = value as ServerUser;
  const role = source.role;
  const accountStatus = source.accountStatus === 'pending' || source.accountStatus === 'suspended' || source.accountStatus === 'deactivated' ? source.accountStatus : 'active';
  if (!source.id || !role || !isSupportedWebRole(role)) return null;
  return {
    id: Number(source.id),
    name: source.name ? String(source.name) : 'LearnPort user',
    email: source.email ? String(source.email) : 'No email provided',
    role,
    accountStatus,
    ...(source.openId ? { openId: String(source.openId) } : {}),
    ...(source.centreId !== undefined && source.centreId !== null ? { centreId: Number(source.centreId) } : {}),
    ...(source.programme ? { programme: String(source.programme) } : {}),
  };
}

const DEMO_SESSION_KEY = 'learnport_demo_session';

function readDemoUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(DEMO_SESSION_KEY);
    return raw ? JSON.parse(raw) as User : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [demoUser, setDemoUser] = useState<User | null>(readDemoUser);
  const sessionQuery = trpc.auth.me.useQuery(undefined, { enabled: !demoUser,
    retry: false,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const logoutMutation = trpc.auth.logout.useMutation();
  const [sessionTimedOut, setSessionTimedOut] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [lastUser, setLastUser] = useState<User | null>(null);
  const hadAuthenticatedSession = useRef(false);
  const authenticatedUser = useMemo(() => normalizeUser(sessionQuery.data), [sessionQuery.data]);
  const user = demoUser ?? authenticatedUser;
  const isDemo = Boolean(demoUser);
  const effectiveUser = user ?? (sessionExpired ? lastUser : null);

  useEffect(() => {
    if (!sessionQuery.isFetching) {
      setSessionTimedOut(false);
      return;
    }

    const timer = window.setTimeout(() => setSessionTimedOut(true), SESSION_CHECK_TIMEOUT_MS);
    return () => window.clearTimeout(timer);
  }, [sessionQuery.isFetching]);

  useEffect(() => {
    if (!user) return;
    hadAuthenticatedSession.current = true;
    setLastUser(user);
    setSessionExpired(false);
  }, [user]);

  useEffect(() => {
    if (!sessionQuery.error) return;
    console.warn('[LearnPort] Session lookup failed', sessionQuery.error.message);
    if (hadAuthenticatedSession.current) setSessionExpired(true);
  }, [sessionQuery.error]);

  const login = (role?: UserRole) => {
    if (role) sessionStorage.setItem('learnport_requested_role', role);
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    setDemoUser(null);
    window.location.assign(buildOAuthLoginUrl(getApiBaseUrl(), window.location.href));
  };

  const selectRole = (role: UserRole) => login(role);

  const demoLogin = (role: UserRole, variant: DemoVariant = 'learner') => {
    const nextUser = demoUserFor(role, variant);
    window.localStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(nextUser));
    setDemoUser(nextUser);
    setSessionExpired(false);
    setSessionTimedOut(false);
  };

  const refresh = async () => {
    setSessionTimedOut(false);
    if (isDemo) return;
    await sessionQuery.refetch();
  };

  const reAuthenticate = () => {
    window.localStorage.removeItem(DEMO_SESSION_KEY);
    setDemoUser(null);
    window.location.assign(buildOAuthLoginUrl(getApiBaseUrl(), window.location.href));
  };

  const logout = async () => {
    try {
      if (!isDemo) await logoutMutation.mutateAsync();
    } finally {
      queryClient.clear();
      sessionStorage.removeItem('learnport_requested_role');
      window.localStorage.removeItem(DEMO_SESSION_KEY);
      setDemoUser(null);
      setLastUser(null);
      setSessionExpired(false);
      window.location.assign('/');
    }
  };

  const error = sessionTimedOut
    ? 'The session check took too long. You can continue to secure sign in or try again.'
    : sessionQuery.error?.message ?? null;

  return <AuthContext.Provider value={{ user: effectiveUser, isLoading: !isDemo && sessionQuery.isLoading && !sessionTimedOut && !sessionExpired, error: isDemo ? null : error, login, logout, selectRole, demoLogin, refresh, isDemo, sessionExpired, reAuthenticate }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
