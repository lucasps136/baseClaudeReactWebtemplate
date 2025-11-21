// IUser service following SOLID principles
import type {
  UserProfile,
  CreateUserInput,
  UpdateUserInput,
  UserListFilter,
  UserListResponse,
} from "../types/user.types";

// Interface Segregation - specific interfaces for user operations
export interface IUserRepository {
  findById(id: string): Promise<UserProfile | null>;
  findMany(filter: UserListFilter): Promise<UserListResponse>;
  create(input: CreateUserInput): Promise<UserProfile>;
  update(id: string, input: UpdateUserInput): Promise<UserProfile>;
  delete(id: string): Promise<void>;
}

export interface IUserValidation {
  validateCreateInput(input: CreateUserInput): Promise<void>;
  validateUpdateInput(input: UpdateUserInput): Promise<void>;
  validateEmail(email: string): boolean;
}

// Single Responsibility - IUser service only handles user business logic
export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private userValidation: IUserValidation,
  ) {}

  async getUserById(id: string): Promise<UserProfile | null> {
    if (!id) throw new Error("User ID is required");
    return this.userRepository.findById(id);
  }

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

  async createUser(input: CreateUserInput): Promise<UserProfile> {
    await this.userValidation.validateCreateInput(input);
    return this.userRepository.create(input);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<UserProfile> {
    if (!id) throw new Error("User ID is required");

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    await this.userValidation.validateUpdateInput(input);
    return this.userRepository.update(id, input);
  }

  async deleteUser(id: string): Promise<void> {
    if (!id) throw new Error("User ID is required");

    const existingUser = await this.userRepository.findById(id);
    if (!existingUser) {
      throw new Error("User not found");
    }

    await this.userRepository.delete(id);
  }
}
