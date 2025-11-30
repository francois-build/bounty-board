import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface RoleGuardProps {
  allowed: string[];
  children: React.ReactElement;
}

export const RoleGuard = ({ allowed, children }: RoleGuardProps) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role === 'unknown') {
    return <Navigate to="/onboarding" replace />;
  }

  if (!profile || !allowed.includes(profile.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};