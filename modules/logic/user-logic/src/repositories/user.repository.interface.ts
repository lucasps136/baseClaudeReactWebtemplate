// Interface Segregation - specific interfaces for user data access operations
import type {
  UserProfile,
  CreateUserInput,
  UpdateUserInput,
  UserListFilter,
  UserListResponse,
} from "../types";

/**
 * Repository interface for user data access
 * Implementations can be Supabase, Prisma, REST API, etc.
 *
 * Following Dependency Inversion Principle:
 * - UserService depends on this abstraction, not on concrete implementations
 */
export interface IUserRepository {
  /**
   * Find user by ID
   * @param id User ID
   * @returns User profile or null if not found
   */
  findById(id: string): Promise<UserProfile | null>;

  /**
   * Find many users with filters
   * @param filter Filter options for search, sort, pagination
   * @returns List response with users, total count and pagination info
   */
  findMany(filter: UserListFilter): Promise<UserListResponse>;

  /**
   * Create new user
   * @param input User creation data
   * @returns Created user profile
   */
  create(input: CreateUserInput): Promise<UserProfile>;

  /**
   * Update existing user
   * @param id User ID
   * @param input Update data
   * @returns Updated user profile
   */
  update(id: string, input: UpdateUserInput): Promise<UserProfile>;

  /**
   * Delete user
   * @param id User ID
   */
  delete(id: string): Promise<void>;
}
