import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';

export function ProtectedRoute({
  children,
  roles,
}: {
  children: React.ReactNode;
  roles?: UserRole[];
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <p className="text-muted animate-pulse text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles && !roles.includes(user.role)) {
    const dash: Record<UserRole, string> = {
      admin: '/admin',
      coordinator: '/coordinator',
      student: '/student',
      supervisor: '/supervisor',
    };
    return <Navigate to={dash[user.role]} replace />;
  }

  return <>{children}</>;
}
