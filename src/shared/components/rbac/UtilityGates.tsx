// Utility RBAC Gates for simple permission/resource checks
// Follows Single Responsibility Principle

"use client";

import { type ReactNode } from "react";

import { RBACGuard } from "./RBACGuard";

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
}: IPermissionGateProps): JSX.Element {
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
}: IResourceGateProps): JSX.Element {
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
