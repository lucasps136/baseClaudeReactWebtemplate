// RBAC Guard component inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Enhanced with SOLID principles and React patterns

"use client";

import { type ReactNode } from "react";

import { useRBAC } from "@/shared/hooks/use-rbac";

export interface IRBACGuardProps {
  children: ReactNode;
  // Permission-based access
  permissions?: string[];
  requireAllPermissions?: boolean;
  // Role-based access
  roles?: string[];
  requireAllRoles?: boolean;
  // Resource-based access
  resource?: string;
  action?: string;
  // Organization context
  organizationId?: string;
  // Fallback components
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  // Alternative: render prop pattern
  render?: (hasAccess: boolean, loading: boolean) => ReactNode;
}

/**
 * RBAC Guard Component
 *
 * Protects components based on user permissions and roles.
 * Follows the Interface Segregation Principle by providing
 * multiple ways to check access.
 *
 * @example
 * // Permission-based protection
 * <RBACGuard permissions={['users.create']}>
 *   <CreateUserButton />
 * </RBACGuard>
 *
 * @example
 * // Role-based protection
 * <RBACGuard roles={['admin', 'owner']}>
 *   <AdminPanel />
 * </RBACGuard>
 *
 * @example
 * // Resource-action protection
 * <RBACGuard resource="users" action="delete">
 *   <DeleteButton />
 * </RBACGuard>
 *
 * @example
 * // Render prop pattern
 * <RBACGuard
 *   permissions={['billing.read']}
 *   render={(hasAccess, loading) => (
 *     loading ? <Spinner /> : hasAccess ? <BillingInfo /> : <UpgradePrompt />
 *   )}
 * />
 */
export function RBACGuard({
  children,
  permissions = [],
  requireAllPermissions = false,
  roles = [],
  requireAllRoles = false,
  resource,
  action,
  organizationId,
  fallback = null,
  loadingFallback = null,
  render,
}: IRBACGuardProps): JSX.Element {
  const { hasPermission, hasRole, canAccess, loading } =
    useRBAC(organizationId);

  // Show loading fallback while fetching RBAC data
  if (loading) {
    if (render) {
      return <>{render(false, true)}</>;
    }
    return <>{loadingFallback}</>;
  }

  // Check access based on provided criteria
  const hasAccess = checkAccess({
    permissions,
    requireAllPermissions,
    roles,
    requireAllRoles,
    resource,
    action,
    hasPermission,
    hasRole,
    canAccess,
  });

  // Use render prop if provided
  if (render) {
    return <>{render(hasAccess, false)}</>;
  }

  // Show children if access granted, fallback otherwise
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

// Helper function to check access (Single Responsibility)
function checkAccess({
  permissions,
  requireAllPermissions,
  roles,
  requireAllRoles,
  resource,
  action,
  hasPermission,
  hasRole,
  canAccess,
}: {
  permissions: string[];
  requireAllPermissions: boolean;
  roles: string[];
  requireAllRoles: boolean;
  resource?: string;
  action?: string;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}): boolean {
  // Resource-action check (highest priority)
  if (resource && action) {
    return canAccess(resource, action);
  }

  // Permission checks
  if (permissions.length > 0) {
    if (requireAllPermissions) {
      return permissions.every((permission) => hasPermission(permission));
    } else {
      return permissions.some((permission) => hasPermission(permission));
    }
  }

  // Role checks
  if (roles.length > 0) {
    if (requireAllRoles) {
      return roles.every((role) => hasRole(role));
    } else {
      return roles.some((role) => hasRole(role));
    }
  }

  // No restrictions specified - allow access
  return true;
}

// HOC pattern for page-level protection
export function withRBACGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<IRBACGuardProps, "children">,
) {
  return function ProtectedComponent(props: P): JSX.Element {
    return (
      <RBACGuard {...guardProps}>
        <Component {...props} />
      </RBACGuard>
    );
  };
}
