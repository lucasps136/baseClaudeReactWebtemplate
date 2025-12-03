// RBAC Components - Centralized exports
export { RBACGuard, withRBACGuard, type IRBACGuardProps } from "./RBACGuard";
export { AdminGuard, OwnerGuard, SuperAdminGuard } from "./SpecializedGuards";
export { PermissionGate, ResourceGate } from "./UtilityGates";

// Legacy export for backward compatibility
export * from "./RBACGuard";
export * from "./SpecializedGuards";
export * from "./UtilityGates";
