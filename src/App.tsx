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
  return <AppShell>{children}</AppShell>;
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <RoleSelect />} />
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
