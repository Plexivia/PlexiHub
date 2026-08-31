import { useAuthStore } from '../stores/authStore';
import { getPermissionsForRole, hasPermission } from '../lib/permissions';
import { Role } from '../types';

export function useRole() {
  const user = useAuthStore((state) => state.user);
  const role = (user?.role || 'Manager') as Role;
  const switchRole = useAuthStore((state) => state.switchRole);
  const permissions = getPermissionsForRole(role);

  return {
    role,
    user,
    isOwner: role === 'Owner',
    isAdmin: role === 'Admin' || role === 'Owner',
    isManager: role === 'Manager',
    canDeploy: role === 'Owner' || role === 'Admin',
    permissions,
    canCreateIssue: permissions.issue.create,
    canEditIssue: permissions.issue.edit,
    canAssignIssue: permissions.issue.assign,
    canCreateSupport: permissions.support.create,
    canManageSupport: permissions.support.manage,
    checkPermission: (module: 'issue' | 'support', action: string) =>
      hasPermission(role, module, action),
    can: (module: 'issue' | 'support', action: string) =>
      hasPermission(role, module, action),
    switchRole,
  };
}
