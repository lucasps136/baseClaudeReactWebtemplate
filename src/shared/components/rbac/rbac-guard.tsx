// RBAC Guard component inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Enhanced with SOLID principles and React patterns

"use client";

import { type ReactNode } from "react";
import { useRBAC } from "@/shared/hooks/use-rbac";

interface IRBACGuardProps {
  children: ReactNode;
  // IPermission-based access
  permissions?: string[];
  requireAllPermissions?: boolean;
  // IRole-based access
  roles?: string[];
  requireAllRoles?: boolean;
  // Resource-based access
  resource?: string;
  action?: string;
  // IOrganization context
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
 * // IPermission-based protection
 * <RBACGuard permissions={['users.create']}>
 *   <CreateUserButton />
 * </RBACGuard>
 *
 * @example
 * // IRole-based protection
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
}: IRBACGuardProps) {
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

  // IPermission checks
  if (permissions.length > 0) {
    if (requireAllPermissions) {
      return permissions.every((permission) => hasPermission(permission));
    } else {
      return permissions.some((permission) => hasPermission(permission));
    }
  }

  // IRole checks
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

// Specialized guard components (Single Responsibility)

interface IAdminGuardProps {
  children: ReactNode;
  organizationId?: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Admin Guard - Only for admin users
 */
export function AdminGuard({
  children,
  organizationId,
  fallback,
  loadingFallback,
}: IAdminGuardProps) {
  return (
    <RBACGuard
      roles={["admin", "super_admin", "owner"]}
      organizationId={organizationId}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </RBACGuard>
  );
}

interface IOwnerGuardProps {
  children: ReactNode;
  organizationId?: string;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Owner Guard - Only for organization owners
 */
export function OwnerGuard({
  children,
  organizationId,
  fallback,
  loadingFallback,
}: IOwnerGuardProps) {
  return (
    <RBACGuard
      roles={["owner", "super_admin"]}
      organizationId={organizationId}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </RBACGuard>
  );
}

interface ISuperAdminGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
}

/**
 * Super Admin Guard - Only for super admins
 */
export function SuperAdminGuard({
  children,
  fallback,
  loadingFallback,
}: ISuperAdminGuardProps) {
  return (
    <RBACGuard
      roles={["super_admin"]}
      fallback={fallback}
      loadingFallback={loadingFallback}
    >
      {children}
    </RBACGuard>
  );
}

// HOC pattern for page-level protection
export function withRBACGuard<P extends object>(
  Component: React.ComponentType<P>,
  guardProps: Omit<IRBACGuardProps, "children">,
) {
  return function ProtectedComponent(props: P) {
    return (
      <RBACGuard {...guardProps}>
        <Component {...props} />
      </RBACGuard>
    );
  };
}

// Utility components for common UI patterns

interface IPermissionGateProps {
  permission: string;
  organizationId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Simple permission gate
 */
export function PermissionGate({
  permission,
  organizationId,
  children,
  fallback,
}: IPermissionGateProps) {
  return (
    <RBACGuard
      permissions={[permission]}
      organizationId={organizationId}
      fallback={fallback}
    >
      {children}
    </RBACGuard>
  );
}

interface IResourceGateProps {
  resource: string;
  action: string;
  organizationId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Simple resource-action gate
 */
export function ResourceGate({
  resource,
  action,
  organizationId,
  children,
  fallback,
}: IResourceGateProps) {
  return (
    <RBACGuard
      resource={resource}
      action={action}
      organizationId={organizationId}
      fallback={fallback}
    >
      {children}
    </RBACGuard>
  );
}
