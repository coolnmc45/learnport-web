import { Navigate, Route, Routes, HashRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { AppShell } from '@/components/AppShell';
import { RoleSelect } from '@/pages/RoleSelect';
import { Dashboard } from '@/pages/Dashboard';
import { Portfolio } from '@/pages/Portfolio';
import { MarkingSuite } from '@/pages/MarkingSuite';
import { FileUpload } from '@/pages/FileUpload';

function LoadingScreen() {
  return <div className="empty-state" style={{ minHeight: '100vh' }}><div><div className="brand-mark" style={{ margin: '0 auto' }}>LP</div><strong>Loading LearnPort</strong><p>Preparing your workspace…</p></div></div>;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!user) return <Navigate to="/" replace />;
  if (user.accountStatus && user.accountStatus !== 'active') return <Navigate to="/account-status" replace />;
  return <AppShell>{children}</AppShell>;
}

function AccountStatus() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/" replace />;
  const title = user.accountStatus === 'pending' ? 'Approval required' : user.accountStatus === 'suspended' ? 'Account suspended' : 'Account deactivated';
  const message = user.accountStatus === 'pending'
    ? 'Your LearnPort account has been created, but an administrator must approve your role and access before you can open a dashboard.'
    : user.accountStatus === 'suspended'
      ? 'Your account is temporarily unavailable. Contact your LearnPort administrator if you believe this is incorrect.'
      : 'Your account is no longer active. Your portfolio history is retained for audit purposes.';
  return <div className="status-page"><div className="status-card surface-card"><div className="brand-mark">LP</div><p className="eyebrow">Account access</p><h2>{title}</h2><p>{message}</p><button className="button-primary" onClick={() => void logout()}>Sign out</button></div></div>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.accountStatus === 'active' ? '/dashboard' : '/account-status'} replace /> : <RoleSelect />} />
      <Route path="/account-status" element={<AccountStatus />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
      <Route path="/marking" element={<ProtectedRoute><MarkingSuite /></ProtectedRoute>} />
      <Route path="/upload" element={<ProtectedRoute><FileUpload /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/'} replace />} />
    </Routes>
  );
}

export function App() {
  return <Router><AuthProvider><AppRoutes /></AuthProvider></Router>;
}
