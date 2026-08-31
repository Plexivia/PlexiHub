import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { hasPermission } from '../lib/permissions';
import { AppPermissions } from '../types';
import { UnauthorizedState } from '../components/ui/states';

interface ProtectedRouteProps {
  children: React.ReactElement;
  requiredModule?: keyof AppPermissions;
  requiredAction?: string;
}

export function ProtectedRoute({ children, requiredModule, requiredAction }: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredModule && requiredAction && !hasPermission(user.role, requiredModule, requiredAction)) {
    return (
      <div className="p-6">
        <UnauthorizedState
          title="Access Restricted"
          description={`Your role (${user.role}) is not authorized to access this resource. Please switch to an account or role with ${requiredModule}:${requiredAction} permissions.`}
        />
      </div>
    );
  }

  return children;
}
