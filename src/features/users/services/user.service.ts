// IUser service following SOLID principles
import type {
  IUserProfile,
  ICreateUserInput,
  IUpdateUserInput,
  IUserListFilter,
  IUserListResponse,
} from "../types/user.types";

// Interface Segregation - specific interfaces for user operations
export interface IUserRepository {
  findById(id: string): Promise<IUserProfile | null>;
  findMany(filter: IUserListFilter): Promise<IUserListResponse>;
  create(input: ICreateUserInput): Promise<IUserProfile>;
  update(id: string, input: IUpdateUserInput): Promise<IUserProfile>;
  delete(id: string): Promise<void>;
}

export interface IUserValidation {
  validateCreateInput(input: ICreateUserInput): Promise<void>;
  validateUpdateInput(input: IUpdateUserInput): Promise<void>;
  validateEmail(email: string): boolean;
}

// Single Responsibility - IUser service only handles user business logic
export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private userValidation: IUserValidation,
  ) {}

  async getUserById(id: string): Promise<IUserProfile | null> {
    if (!id) throw new Error("User ID is required");
    return this.userRepository.findById(id);
  }

  async getUsers(filter: IUserListFilter = {}): Promise<IUserListResponse> {
    // Set defaults
    const normalizedFilter: IUserListFilter = {
      limit: 20,
      offset: 0,
      sortBy: "createdAt",
      sortOrder: "desc",
      ...filter,
    };

    return this.userRepository.findMany(normalizedFilter);
  }

  async createUser(input: ICreateUserInput): Promise<IUserProfile> {
    await this.userValidation.validateCreateInput(input);
    return this.userRepository.create(input);
  }

  async updateUser(id: string, input: IUpdateUserInput): Promise<IUserProfile> {
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
