import { Role, AppPermissions } from '../types';

export const ROLE_PERMISSIONS: Record<Role, AppPermissions> = {
  Owner: {
    issue: {
      create: true,
      edit: true,
      assign: true,
    },
    support: {
      create: true,
      manage: true,
    },
  },
  Admin: {
    issue: {
      create: true,
      edit: true,
      assign: true,
    },
    support: {
      create: true,
      manage: true,
    },
  },
  Manager: {
    issue: {
      create: true,
      edit: true,
      assign: false,
    },
    support: {
      create: true,
      manage: false,
    },
  },
};

export function getPermissionsForRole(role: Role): AppPermissions {
  return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.Manager;
}

export function hasPermission(
  role: Role,
  module: keyof AppPermissions,
  action: string
): boolean {
  const permissions = getPermissionsForRole(role);
  const modulePerms = permissions[module] as Record<string, boolean> | undefined;
  return !!modulePerms?.[action];
}
