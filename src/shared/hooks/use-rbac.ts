// RBAC hook inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Enhanced with SOLID principles and React patterns

"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  IRBACError,
  IPermission,
  IRole,
  IUseRBACReturn,
} from "@/shared/types/rbac";

import { useAuth } from "@/shared/hooks/use-auth";
import { getRBACProvider } from "@/shared/services/rbac/rbac-factory";

export function useRBAC(organizationId?: string): IUseRBACReturn {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<IRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<IPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<IRBACError | null>(null);

  // Fetch user roles and permissions
  const fetchRBACData = useCallback(async () => {
    if (!user?.id) {
      setUserRoles([]);
      setUserPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const rbacProvider = getRBACProvider();

      const [roles, permissions] = await Promise.all([
        rbacProvider.getUserRoles(user.id, organizationId),
        rbacProvider.getUserPermissions(user.id, organizationId),
      ]);

      setUserRoles(roles);
      setUserPermissions(permissions);
    } catch (err) {
      const error = err as IRBACError;
      setError(error);
      console.error("Failed to fetch RBAC data:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, organizationId]);

  // Check if user has specific permission
  const hasPermission = useCallback(
    (permission: string): boolean => {
      return userPermissions.some((p) => p.name === permission);
    },
    [userPermissions],
  );

  // Check if user has specific role
  const hasRole = useCallback(
    (role: string): boolean => {
      return userRoles.some((r) => r.name === role);
    },
    [userRoles],
  );

  // Check if user can access resource with action
  const canAccess = useCallback(
    (resource: string, action: string): boolean => {
      const permissionName = `${resource}.${action}`;
      return hasPermission(permissionName);
    },
    [hasPermission],
  );

  // Refetch RBAC data
  const refetch = useCallback(async () => {
    await fetchRBACData();
  }, [fetchRBACData]);

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchRBACData();
  }, [fetchRBACData]);

  return {
    userRoles,
    userPermissions,
    hasPermission,
    hasRole,
    canAccess,
    loading,
    organizationId,
    refetch,
    error,
  };
}

// Specialized hooks for common use cases

// Hook for admin users
export function useIsAdmin(organizationId?: string): boolean {
  const { hasRole, loading } = useRBAC(organizationId);

  if (loading) return false;

  return hasRole("admin") || hasRole("super_admin") || hasRole("owner");
}

// Hook for checking multiple permissions
export function useHasAnyPermission(
  permissions: string[],
  organizationId?: string,
): boolean {
  const { hasPermission, loading } = useRBAC(organizationId);

  if (loading) return false;

  return permissions.some((permission) => hasPermission(permission));
}

// Hook for checking all permissions
export function useHasAllPermissions(
  permissions: string[],
  organizationId?: string,
): boolean {
  const { hasPermission, loading } = useRBAC(organizationId);

  if (loading) return false;

  return permissions.every((permission) => hasPermission(permission));
}

// Hook for organization access
export function useCanAccessOrganization(organizationId: string): boolean {
  const { userRoles, loading } = useRBAC(organizationId);

  if (loading) return false;

  return userRoles.length > 0;
}

// Hook for resource access
export function useCanAccessResource(
  resource: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Parameter kept for API compatibility
  _actions: string[] = ["read"],
  organizationId?: string,
): {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canAccess: (action: string) => boolean;
  loading: boolean;
} {
  const { canAccess, loading } = useRBAC(organizationId);

  return {
    canRead: canAccess(resource, "read"),
    canWrite: canAccess(resource, "update"),
    canDelete: canAccess(resource, "delete"),
    canAccess: (action: string) => canAccess(resource, action),
    loading,
  };
}
