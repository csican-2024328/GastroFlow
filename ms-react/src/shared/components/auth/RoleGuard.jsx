import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../../features/auth/store/authStore.js';

export const RoleGuard = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuthStore();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-900"></div>
          <p className="text-stone-600">Validando permisos...</p>
        </div>
      </div>
    );
  }

  const userRole = (user?.role || '').toString().trim().toUpperCase();
  const hasPermission = allowedRoles.some(role => role.toUpperCase() === userRole);

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
};
