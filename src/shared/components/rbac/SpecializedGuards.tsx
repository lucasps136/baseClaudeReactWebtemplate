// Specialized RBAC Guards for common use cases
// Follows Single Responsibility Principle

"use client";

import { type ReactNode } from "react";

import { RBACGuard } from "./RBACGuard";

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
}: IAdminGuardProps): JSX.Element {
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
}: IOwnerGuardProps): JSX.Element {
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
}: ISuperAdminGuardProps): JSX.Element {
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
