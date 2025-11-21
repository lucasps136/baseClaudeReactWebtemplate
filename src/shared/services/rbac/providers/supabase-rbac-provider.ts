// Supabase RBAC implementation inspired by Next.js SaaS Starter
// Repository: https://github.com/nextjs/saas-starter
// Enhanced with SOLID principles

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  IRBACProvider,
  IRole,
  IPermission,
  IUserRole,
  IAssignRoleOptions,
  IRBACError,
} from "@/shared/types/rbac";
import { getEnv } from "@/config/env";

export class SupabaseRBACProvider implements IRBACProvider {
  private supabase: SupabaseClient;

  constructor() {
    const env = getEnv();

    if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Supabase configuration is required for RBAC");
    }

    // Using service role key for admin operations
    this.supabase = createClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: { persistSession: false },
      },
    );
  }

  // Roles (Single Responsibility)
  async getRoles(): Promise<IRole[]> {
    try {
      const { data, error } = await this.supabase
        .from("roles")
        .select("*")
        .order("name");

      if (error) throw error;

      return data.map(this.mapSupabaseRole);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async getRole(roleId: string): Promise<IRole | null> {
    try {
      const { data, error } = await this.supabase
        .from("roles")
        .select("*")
        .eq("id", roleId)
        .single();

      if (error && error.code === "PGRST116") return null;
      if (error) throw error;

      return this.mapSupabaseRole(data);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async createRole(
    data: Omit<IRole, "id" | "createdAt" | "updatedAt">,
  ): Promise<IRole> {
    try {
      const { data: role, error } = await this.supabase
        .from("roles")
        .insert({
          name: data.name,
          description: data.description,
          is_system: data.isSystem,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapSupabaseRole(role);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async updateRole(roleId: string, data: Partial<IRole>): Promise<IRole> {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.isSystem !== undefined) updateData.is_system = data.isSystem;

      const { data: role, error } = await this.supabase
        .from("roles")
        .update(updateData)
        .eq("id", roleId)
        .select()
        .single();

      if (error) throw error;

      return this.mapSupabaseRole(role);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async deleteRole(roleId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  // Permissions (Single Responsibility)
  async getPermissions(): Promise<IPermission[]> {
    try {
      const { data, error } = await this.supabase
        .from("permissions")
        .select("*")
        .order("resource, action");

      if (error) throw error;

      return data.map(this.mapSupabasePermission);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async getPermission(permissionId: string): Promise<IPermission | null> {
    try {
      const { data, error } = await this.supabase
        .from("permissions")
        .select("*")
        .eq("id", permissionId)
        .single();

      if (error && error.code === "PGRST116") return null;
      if (error) throw error;

      return this.mapSupabasePermission(data);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async createPermission(
    data: Omit<IPermission, "id" | "createdAt">,
  ): Promise<IPermission> {
    try {
      const { data: permission, error } = await this.supabase
        .from("permissions")
        .insert({
          name: data.name,
          description: data.description,
          resource: data.resource,
          action: data.action,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapSupabasePermission(permission);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async updatePermission(
    permissionId: string,
    data: Partial<IPermission>,
  ): Promise<IPermission> {
    try {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.resource) updateData.resource = data.resource;
      if (data.action) updateData.action = data.action;

      const { data: permission, error } = await this.supabase
        .from("permissions")
        .update(updateData)
        .eq("id", permissionId)
        .select()
        .single();

      if (error) throw error;

      return this.mapSupabasePermission(permission);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async deletePermission(permissionId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("permissions")
        .delete()
        .eq("id", permissionId);

      if (error) throw error;
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  // IRole Permissions (Single Responsibility)
  async getRolePermissions(roleId: string): Promise<IPermission[]> {
    try {
      const { data, error } = await this.supabase
        .from("role_permissions")
        .select(
          `
          permissions (
            id,
            name,
            description,
            resource,
            action,
            created_at
          )
        `,
        )
        .eq("role_id", roleId);

      if (error) throw error;

      return data.map((item) => this.mapSupabasePermission(item.permissions));
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      const { error } = await this.supabase.from("role_permissions").insert({
        role_id: roleId,
        permission_id: permissionId,
      });

      if (error) throw error;
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from("role_permissions")
        .delete()
        .eq("role_id", roleId)
        .eq("permission_id", permissionId);

      if (error) throw error;
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  // IUser Roles (Single Responsibility)
  async getUserRoles(
    userId: string,
    organizationId?: string,
  ): Promise<IRole[]> {
    try {
      let query = this.supabase
        .from("user_roles")
        .select(
          `
          roles (
            id,
            name,
            description,
            is_system,
            created_at,
            updated_at
          )
        `,
        )
        .eq("user_id", userId)
        .eq("is_active", true);

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((item) => this.mapSupabaseRole(item.roles));
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async getUserPermissions(
    userId: string,
    organizationId?: string,
  ): Promise<IPermission[]> {
    try {
      // Use the helper function from the database
      const { data, error } = await this.supabase.rpc("get_user_permissions", {
        user_id: userId,
      });

      if (error) throw error;

      return data.map((item: any) => ({
        id: "", // Not returned by function
        name: item.permission_name,
        description: "",
        resource: item.resource,
        action: item.action,
        createdAt: new Date(),
      }));
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async assignRoleToUser(
    userId: string,
    roleId: string,
    options: IAssignRoleOptions = {},
  ): Promise<IUserRole> {
    try {
      const { data, error } = await this.supabase
        .from("user_roles")
        .insert({
          user_id: userId,
          role_id: roleId,
          organization_id: options.organizationId,
          assigned_by: options.assignedBy,
          expires_at: options.expiresAt?.toISOString(),
          is_active: options.isActive ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapSupabaseUserRole(data);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async removeRoleFromUser(
    userId: string,
    roleId: string,
    organizationId?: string,
  ): Promise<void> {
    try {
      let query = this.supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role_id", roleId);

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { error } = await query;

      if (error) throw error;
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  // IPermission Checking (Interface Segregation)
  async userHasPermission(
    userId: string,
    permissionName: string,
    organizationId?: string,
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.rpc("user_has_permission", {
        user_id: userId,
        permission_name: permissionName,
        organization_id: organizationId,
      });

      if (error) throw error;

      return data;
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async userHasRole(
    userId: string,
    roleName: string,
    organizationId?: string,
  ): Promise<boolean> {
    try {
      let query = this.supabase
        .from("user_roles")
        .select(
          `
          roles!inner (name)
        `,
        )
        .eq("user_id", userId)
        .eq("roles.name", roleName)
        .eq("is_active", true);

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data && data.length > 0;
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  // Multi-tenant support
  async getUsersByRole(
    roleName: string,
    organizationId?: string,
  ): Promise<string[]> {
    try {
      let query = this.supabase
        .from("user_roles")
        .select(
          `
          user_id,
          roles!inner (name)
        `,
        )
        .eq("roles.name", roleName)
        .eq("is_active", true);

      if (organizationId) {
        query = query.eq("organization_id", organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data.map((item) => item.user_id);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  async getOrganizationUsers(organizationId: string): Promise<IUserRole[]> {
    try {
      const { data, error } = await this.supabase
        .from("user_roles")
        .select("*")
        .eq("organization_id", organizationId)
        .eq("is_active", true);

      if (error) throw error;

      return data.map(this.mapSupabaseUserRole);
    } catch (error) {
      throw this.mapSupabaseError(error);
    }
  }

  // Initialization
  async initialize(): Promise<void> {
    try {
      // Test connection with a simple query
      const { error } = await this.supabase
        .from("roles")
        .select("count")
        .limit(1);

      if (error) {
        throw new Error(`Failed to initialize RBAC: ${error.message}`);
      }
    } catch (error) {
      throw new Error(`Failed to initialize RBAC: ${(error as Error).message}`);
    }
  }

  async cleanup(): Promise<void> {
    // Supabase client cleanup is automatic
  }

  // Mappers (Single Responsibility)
  private mapSupabaseRole = (role: any): IRole => ({
    id: role.id,
    name: role.name,
    description: role.description,
    isSystem: role.is_system,
    createdAt: new Date(role.created_at),
    updatedAt: new Date(role.updated_at),
  });

  private mapSupabasePermission = (permission: any): IPermission => ({
    id: permission.id,
    name: permission.name,
    description: permission.description,
    resource: permission.resource,
    action: permission.action,
    createdAt: new Date(permission.created_at),
  });

  private mapSupabaseUserRole = (userRole: any): IUserRole => ({
    id: userRole.id,
    userId: userRole.user_id,
    roleId: userRole.role_id,
    organizationId: userRole.organization_id,
    assignedBy: userRole.assigned_by,
    assignedAt: new Date(userRole.assigned_at),
    expiresAt: userRole.expires_at ? new Date(userRole.expires_at) : undefined,
    isActive: userRole.is_active,
  });

  private mapSupabaseError = (error: any): IRBACError => ({
    code: error.code || "unknown_error",
    message: error.message || "An unknown error occurred",
    details: error,
  });
}
