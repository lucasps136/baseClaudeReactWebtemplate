// User service following SOLID principles
import type {
  UserProfile,
  CreateUserInput,
  UpdateUserInput,
  UserListFilter,
  UserListResponse,
} from "../types";
import type { IUserRepository } from "../repositories/user.repository.interface";
import type { IUserValidation } from "../validations/user.validation";

/**
 * UserService - Single Responsibility Principle
 * Handles only user business logic, delegates data access to repository
 * and validation to validation service
 *
 * Dependency Inversion Principle:
 * Depends on IUserRepository and IUserValidation abstractions,
 * not on concrete implementations
 */
export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private userValidation: IUserValidation,
  ) {}

  /**
   * Get user by ID
   * @param id User ID
   * @returns User profile or null if not found
   * @throws Error if ID is empty
   */
  async getUserById(id: string): Promise<UserProfile | null> {
    if (!id) throw new Error("User ID is required");
    return this.userRepository.findById(id);
  }

  /**
   * Get list of users with filters
   * @param filter Optional filter criteria
   * @returns User list with pagination info
   */
  async getUsers(filter: UserListFilter = {}): Promise<UserListResponse> {
    // Set defaults
    const normalizedFilter: UserListFilter = {
      limit: 20,
      offset: 0,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filter,
    };

    return this.userRepository.findMany(normalizedFilter);
  }

  /**
   * Create new user
   * @param input User creation data
   * @returns Created user profile
   * @throws Error if validation fails
   */
  async createUser(input: CreateUserInput): Promise<UserProfile> {
    await this.userValidation.validateCreateInput(input);
    return this.userRepository.create(input);
  }

  /**
   * Update existing user
   * @param id User ID
   * @param input Update data
   * @returns Updated user profile
   * @throws Error if user not found or validation fails
   */
  async updateUser(id: string, input: UpdateUserInput): Promise<UserProfile> {
    if (!id) throw new Error("User ID is required");

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    await this.userValidation.validateUpdateInput(input);
    return this.userRepository.update(id, input);
  }

  /**
   * Delete user
   * @param id User ID
   * @throws Error if user not found
   */
  async deleteUser(id: string): Promise<void> {
    if (!id) throw new Error("User ID is required");

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(id);
  }
}
