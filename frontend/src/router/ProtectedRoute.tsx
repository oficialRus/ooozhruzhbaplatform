import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ModuleKey } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule?: ModuleKey;
}

export default function ProtectedRoute({ children, requiredModule }: ProtectedRouteProps) {
  const { user, isAuthenticated, canAccessModule } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredModule && !canAccessModule(requiredModule)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
