import type { CreateUserInput, UpdateUserInput } from "../types";

/**
 * Validation interface for user operations
 * Implementations can use Zod, Yup, or custom validation
 */
export interface IUserValidation {
  validateCreateInput(input: CreateUserInput): Promise<void>;
  validateUpdateInput(input: UpdateUserInput): Promise<void>;
  validateEmail(email: string): boolean;
}

/**
 * Default validation implementation
 * Can be replaced with custom implementation following IUserValidation interface
 */
export class UserValidation implements IUserValidation {
  async validateCreateInput(input: CreateUserInput): Promise<void> {
    const errors: string[] = [];

    // Email validation
    if (!input.email) {
      errors.push("Email is required");
    } else if (!this.validateEmail(input.email)) {
      errors.push("Invalid email format");
    }

    // Name validation
    if (!input.name) {
      errors.push("Name is required");
    } else if (input.name.length < 2) {
      errors.push("Name must be at least 2 characters");
    } else if (input.name.length > 100) {
      errors.push("Name must be less than 100 characters");
    }

    // Bio validation (optional field)
    if (input.bio && input.bio.length > 500) {
      errors.push("Bio must be less than 500 characters");
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  }

  async validateUpdateInput(input: UpdateUserInput): Promise<void> {
    const errors: string[] = [];

    // Name validation (if provided)
    if (input.name !== undefined) {
      if (input.name.length < 2) {
        errors.push("Name must be at least 2 characters");
      } else if (input.name.length > 100) {
        errors.push("Name must be less than 100 characters");
      }
    }

    // Bio validation (if provided)
    if (input.bio !== undefined && input.bio.length > 500) {
      errors.push("Bio must be less than 500 characters");
    }

    // Avatar validation (if provided)
    if (input.avatar !== undefined && !this.isValidUrl(input.avatar)) {
      errors.push("Avatar must be a valid URL");
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}
