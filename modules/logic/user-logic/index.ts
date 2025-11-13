// User Logic Module
// Business logic layer for user management following SOLID principles

// Services
export { UserService } from "./src/services/user.service";

// Repositories
export type { IUserRepository } from "./src/repositories/user.repository.interface";

// Validations
export { UserValidation } from "./src/validations/user.validation";
export type { IUserValidation } from "./src/validations/user.validation";

// Types
export type {
  UserProfile,
  CreateUserInput,
  UpdateUserInput,
  UserListFilter,
  UserListResponse,
} from "./src/types";
