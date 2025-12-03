// RBAC types inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Enhanced with SOLID principles for our template

export interface IRole {
  id: string;
  name: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPermission {
  id: string;
  name: string;
  description?: string;
  resource: string;
  action: string;
  createdAt: Date;
}

export interface IUserRole {
  id: string;
  userId: string;
  roleId: string;
  organizationId?: string;
  assignedBy?: string;
  assignedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface IRolePermission {
  roleId: string;
  permissionId: string;
  createdAt: Date;
}

// RBAC Provider Interface (Dependency Inversion Principle)
export interface IRBACProvider {
  // Roles
  getRoles(): Promise<IRole[]>;
  getRole(roleId: string): Promise<IRole | null>;
  createRole(
    data: Omit<IRole, "id" | "createdAt" | "updatedAt">,
  ): Promise<IRole>;
  updateRole(roleId: string, data: Partial<IRole>): Promise<IRole>;
  deleteRole(roleId: string): Promise<void>;

  // Permissions
  getPermissions(): Promise<IPermission[]>;
  getPermission(permissionId: string): Promise<IPermission | null>;
  createPermission(
    data: Omit<IPermission, "id" | "createdAt">,
  ): Promise<IPermission>;
  updatePermission(
    permissionId: string,
    data: Partial<IPermission>,
  ): Promise<IPermission>;
  deletePermission(permissionId: string): Promise<void>;

  // IRole Permissions
  getRolePermissions(roleId: string): Promise<IPermission[]>;
  assignPermissionToRole(roleId: string, permissionId: string): Promise<void>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;

  // IUser Roles
  getUserRoles(userId: string, organizationId?: string): Promise<IRole[]>;
  getUserPermissions(
    userId: string,
    organizationId?: string,
  ): Promise<IPermission[]>;
  assignRoleToUser(
    userId: string,
    roleId: string,
    options?: IAssignRoleOptions,
  ): Promise<IUserRole>;
  removeRoleFromUser(
    userId: string,
    roleId: string,
    organizationId?: string,
  ): Promise<void>;

  // IPermission Checking
  userHasPermission(
    userId: string,
    permissionName: string,
    organizationId?: string,
  ): Promise<boolean>;
  userHasRole(
    userId: string,
    roleName: string,
    organizationId?: string,
  ): Promise<boolean>;

  // Multi-tenant support
  getUsersByRole(roleName: string, organizationId?: string): Promise<string[]>;
  getOrganizationUsers(organizationId: string): Promise<IUserRole[]>;

  // Initialization
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

// Configuration options
export interface IAssignRoleOptions {
  organizationId?: string;
  assignedBy?: string;
  expiresAt?: Date;
  isActive?: boolean;
}

export interface IRBACProviderConfig {
  type: RBACProviderType;
  options: Record<string, unknown>;
}

// Provider types for Factory Pattern
export type RBACProviderType = "supabase" | "database";

// JWT Claims interface (for integration with auth providers)
export interface IRBACClaims {
  user_roles: string[];
  user_permissions: string[];
}

// Response types
export interface IRBACResponse<T = unknown> {
  data: T | null;
  error: IRBACError | null;
}

export interface IRBACError {
  code: string;
  message: string;
  details?: unknown;
}

// Pre-defined roles and permissions (from database schema)
export const DEFAULT_ROLES = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
  OWNER: "owner",
  MEMBER: "member",
  VIEWER: "viewer",
} as const;

export const DEFAULT_PERMISSIONS = {
  // Users
  USERS_CREATE: "users.create",
  USERS_READ: "users.read",
  USERS_UPDATE: "users.update",
  USERS_DELETE: "users.delete",
  USERS_INVITE: "users.invite",

  // IOrganization
  ORGANIZATION_READ: "organization.read",
  ORGANIZATION_UPDATE: "organization.update",
  ORGANIZATION_DELETE: "organization.delete",
  ORGANIZATION_BILLING: "organization.billing",

  // Content
  CONTENT_CREATE: "content.create",
  CONTENT_READ: "content.read",
  CONTENT_UPDATE: "content.update",
  CONTENT_DELETE: "content.delete",
  CONTENT_PUBLISH: "content.publish",

  // Billing
  BILLING_READ: "billing.read",
  BILLING_UPDATE: "billing.update",
  BILLING_CANCEL: "billing.cancel",

  // Analytics
  ANALYTICS_READ: "analytics.read",
  REPORTS_EXPORT: "reports.export",

  // System
  SYSTEM_LOGS: "system.logs",
  SYSTEM_SETTINGS: "system.settings",
} as const;

// Utility types
export type DefaultRole = (typeof DEFAULT_ROLES)[keyof typeof DEFAULT_ROLES];
export type DefaultPermission =
  (typeof DEFAULT_PERMISSIONS)[keyof typeof DEFAULT_PERMISSIONS];

// Helper functions
export const isSystemRole = (roleName: string): boolean => {
  return Object.values(DEFAULT_ROLES).includes(roleName as DefaultRole);
};

export const hasRequiredPermissions = (
  userPermissions: string[],
  requiredPermissions: string[],
): boolean => {
  return requiredPermissions.every((permission) =>
    userPermissions.includes(permission),
  );
};

export const canAccessResource = (
  userPermissions: string[],
  resource: string,
  action: string,
): boolean => {
  const permissionName = `${resource}.${action}`;
  return userPermissions.includes(permissionName);
};

// Resource-action mapping for type safety
export interface IResourceAction {
  resource: string;
  action:
    | "create"
    | "read"
    | "update"
    | "delete"
    | "invite"
    | "publish"
    | "billing"
    | "export";
}

// Multi-tenant organization support
export interface IOrganization {
  id: string;
  name: string;
  ownerId: string;
  settings?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// RBAC Context for React components
export interface IRBACContext {
  userRoles: IRole[];
  userPermissions: IPermission[];
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
  loading: boolean;
  organizationId?: string;
}

// Hook return type for useRBAC
export interface IUseRBACReturn extends IRBACContext {
  refetch: () => Promise<void>;
  error: IRBACError | null;
}
