# User Logic Module

> Business logic layer for user management following SOLID principles

## Overview

This module provides the business logic layer for user management, implementing SOLID principles:

- **Single Responsibility**: Each class has one clear purpose
- **Open/Closed**: Extensible through interfaces
- **Liskov Substitution**: Interfaces can be substituted
- **Interface Segregation**: Specific, focused interfaces
- **Dependency Inversion**: Depends on abstractions, not implementations

## Installation

This module is framework-agnostic and has no external dependencies except TypeScript.

**Dependencies:** None (pure TypeScript)

## Architecture

```
UserService (Business Logic)
    ↓ depends on
IUserRepository (Abstraction)    IUserValidation (Abstraction)
    ↓ implemented by                   ↓ implemented by
SupabaseUserRepository           UserValidation
PostgresUserRepository           ZodUserValidation
MockUserRepository               YupUserValidation
etc.                             etc.
```

## Usage

### Basic Setup

```typescript
import {
  UserService,
  UserValidation,
  IUserRepository,
} from "@/modules/logic/user-logic";

// 1. Create or inject repository implementation
class MyUserRepository implements IUserRepository {
  async findById(id: string) {
    /* implementation */
  }
  async findMany(filter) {
    /* implementation */
  }
  async create(input) {
    /* implementation */
  }
  async update(id, input) {
    /* implementation */
  }
  async delete(id) {
    /* implementation */
  }
}

// 2. Create validation (or use default)
const validation = new UserValidation();

// 3. Instantiate service with dependencies
const repository = new MyUserRepository();
const userService = new UserService(repository, validation);

// 4. Use the service
const user = await userService.getUserById("123");
```

### With Dependency Injection

```typescript
// In your DI container configuration
container.register("IUserRepository", SupabaseUserRepository);
container.register("IUserValidation", UserValidation);
container.register("UserService", UserService, [
  "IUserRepository",
  "IUserValidation",
]);

// Usage
const userService = container.resolve<UserService>("UserService");
const users = await userService.getUsers({ limit: 10 });
```

### Factory Pattern

```typescript
class UserServiceFactory {
  static create(type: "supabase" | "prisma" | "mock"): UserService {
    let repository: IUserRepository;

    switch (type) {
      case "supabase":
        repository = new SupabaseUserRepository();
        break;
      case "prisma":
        repository = new PrismaUserRepository();
        break;
      case "mock":
        repository = new MockUserRepository();
        break;
    }

    const validation = new UserValidation();
    return new UserService(repository, validation);
  }
}

// Usage
const userService = UserServiceFactory.create("supabase");
```

## API Reference

### UserService

Main service class for user business logic.

#### Constructor

```typescript
new UserService(
  userRepository: IUserRepository,
  userValidation: IUserValidation
)
```

#### Methods

##### getUserById

```typescript
async getUserById(id: string): Promise<UserProfile | null>
```

Get user by ID.

**Parameters:**

- `id`: User ID (required)

**Returns:** User profile or null if not found

**Throws:** Error if ID is empty

**Example:**

```typescript
const user = await userService.getUserById("user-123");
if (user) {
  console.log(user.name);
}
```

##### getUsers

```typescript
async getUsers(filter?: UserListFilter): Promise<UserListResponse>
```

Get list of users with optional filters.

**Parameters:**

- `filter`: Optional filter criteria
  - `search`: Search term
  - `sortBy`: Field to sort by ('name', 'email', 'createdAt')
  - `sortOrder`: Sort direction ('asc', 'desc')
  - `limit`: Number of results (default: 20)
  - `offset`: Pagination offset (default: 0)

**Returns:** User list response with users, total, hasMore

**Example:**

```typescript
const response = await userService.getUsers({
  search: "john",
  sortBy: "name",
  sortOrder: "asc",
  limit: 10,
  offset: 0,
});

console.log(response.users);
console.log(response.total);
console.log(response.hasMore);
```

##### createUser

```typescript
async createUser(input: CreateUserInput): Promise<UserProfile>
```

Create new user.

**Parameters:**

- `input`: User creation data
  - `email`: User email (required)
  - `name`: User name (required)
  - `bio`: User bio (optional)

**Returns:** Created user profile

**Throws:** Error if validation fails

**Example:**

```typescript
const newUser = await userService.createUser({
  email: "john@example.com",
  name: "John Doe",
  bio: "Software developer",
});
```

##### updateUser

```typescript
async updateUser(id: string, input: UpdateUserInput): Promise<UserProfile>
```

Update existing user.

**Parameters:**

- `id`: User ID (required)
- `input`: Update data
  - `name`: New name (optional)
  - `bio`: New bio (optional)
  - `avatar`: New avatar URL (optional)

**Returns:** Updated user profile

**Throws:** Error if user not found or validation fails

**Example:**

```typescript
const updated = await userService.updateUser("user-123", {
  name: "John Smith",
  bio: "Senior developer",
});
```

##### deleteUser

```typescript
async deleteUser(id: string): Promise<void>
```

Delete user.

**Parameters:**

- `id`: User ID (required)

**Throws:** Error if user not found

**Example:**

```typescript
await userService.deleteUser("user-123");
```

### IUserRepository

Repository interface for data access. Implement this interface to create custom repositories.

```typescript
interface IUserRepository {
  findById(id: string): Promise<UserProfile | null>;
  findMany(filter: UserListFilter): Promise<UserListResponse>;
  create(input: CreateUserInput): Promise<UserProfile>;
  update(id: string, input: UpdateUserInput): Promise<UserProfile>;
  delete(id: string): Promise<void>;
}
```

**Example Implementation:**

```typescript
class SupabaseUserRepository implements IUserRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data as UserProfile;
  }

  // ... implement other methods
}
```

### IUserValidation

Validation interface. Implement for custom validation logic.

```typescript
interface IUserValidation {
  validateCreateInput(input: CreateUserInput): Promise<void>;
  validateUpdateInput(input: UpdateUserInput): Promise<void>;
  validateEmail(email: string): boolean;
}
```

**Example with Zod:**

```typescript
import { z } from "zod";

class ZodUserValidation implements IUserValidation {
  private createSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
    bio: z.string().max(500).optional(),
  });

  async validateCreateInput(input: CreateUserInput): Promise<void> {
    this.createSchema.parse(input);
  }

  // ... implement other methods
}
```

### UserValidation

Default validation implementation included in module.

## Examples

### Example 1: Basic CRUD Operations

Complete example of all CRUD operations:

```typescript
import { UserService, UserValidation } from "@/modules/logic/user-logic";
import { SupabaseUserRepository } from "./repositories/supabase-user.repository";

// Setup
const repository = new SupabaseUserRepository();
const validation = new UserValidation();
const userService = new UserService(repository, validation);

// CREATE
async function createNewUser() {
  try {
    const newUser = await userService.createUser({
      email: "john.doe@example.com",
      name: "John Doe",
      bio: "Software developer passionate about clean code",
    });
    console.log("User created:", newUser.id);
    return newUser;
  } catch (error) {
    console.error("Failed to create user:", error.message);
  }
}

// READ - Single user
async function getUserProfile(userId: string) {
  try {
    const user = await userService.getUserById(userId);
    if (user) {
      console.log("User found:", user.name);
      return user;
    } else {
      console.log("User not found");
    }
  } catch (error) {
    console.error("Failed to fetch user:", error.message);
  }
}

// READ - List with filters
async function searchUsers(searchTerm: string) {
  try {
    const response = await userService.getUsers({
      search: searchTerm,
      sortBy: "name",
      sortOrder: "asc",
      limit: 10,
      offset: 0,
    });

    console.log(`Found ${response.total} users`);
    console.log("Users:", response.users);
    console.log("Has more:", response.hasMore);

    return response;
  } catch (error) {
    console.error("Failed to search users:", error.message);
  }
}

// UPDATE
async function updateUserProfile(userId: string) {
  try {
    const updated = await userService.updateUser(userId, {
      name: "John Smith",
      bio: "Senior software developer",
      avatar: "https://example.com/avatars/john.jpg",
    });
    console.log("User updated:", updated.name);
    return updated;
  } catch (error) {
    console.error("Failed to update user:", error.message);
  }
}

// DELETE
async function removeUser(userId: string) {
  try {
    await userService.deleteUser(userId);
    console.log("User deleted successfully");
  } catch (error) {
    console.error("Failed to delete user:", error.message);
  }
}
```

### Example 2: Custom Repository Implementation

How to create a custom repository for different data sources:

```typescript
// repositories/prisma-user.repository.ts
import { PrismaClient } from "@prisma/client";
import type {
  IUserRepository,
  UserProfile,
  CreateUserInput,
  UpdateUserInput,
  UserListFilter,
  UserListResponse,
} from "@/modules/logic/user-logic";

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserProfile | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async findMany(filter: UserListFilter): Promise<UserListResponse> {
    const where = filter.search
      ? {
          OR: [
            { name: { contains: filter.search, mode: "insensitive" } },
            { email: { contains: filter.search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { [filter.sortBy || "createdAt"]: filter.sortOrder || "desc" },
        take: filter.limit || 20,
        skip: filter.offset || 0,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar || undefined,
        bio: user.bio || undefined,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
      total,
      hasMore: (filter.offset || 0) + users.length < total,
    };
  }

  async create(input: CreateUserInput): Promise<UserProfile> {
    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        bio: input.bio,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async update(id: string, input: UpdateUserInput): Promise<UserProfile> {
    const user = await this.prisma.user.update({
      where: { id },
      data: input,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar || undefined,
      bio: user.bio || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}

// Usage
const prisma = new PrismaClient();
const repository = new PrismaUserRepository(prisma);
const validation = new UserValidation();
const userService = new UserService(repository, validation);
```

### Example 3: Custom Validation with Zod

Implementing custom validation using Zod:

```typescript
// validations/zod-user.validation.ts
import { z } from "zod";
import type {
  IUserValidation,
  CreateUserInput,
  UpdateUserInput,
} from "@/modules/logic/user-logic";

const createUserSchema = z.object({
  email: z.string().email("Invalid email format").min(3, "Email too short"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
});

const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  avatar: z.string().url("Avatar must be a valid URL").optional(),
});

export class ZodUserValidation implements IUserValidation {
  async validateCreateInput(input: CreateUserInput): Promise<void> {
    createUserSchema.parse(input);
  }

  async validateUpdateInput(input: UpdateUserInput): Promise<void> {
    updateUserSchema.parse(input);
  }

  validateEmail(email: string): boolean {
    return z.string().email().safeParse(email).success;
  }
}

// Usage
import { UserService } from "@/modules/logic/user-logic";
import { ZodUserValidation } from "./validations/zod-user.validation";

const validation = new ZodUserValidation();
const userService = new UserService(repository, validation);
```

### Example 4: Error Handling Patterns

Best practices for handling errors:

```typescript
import { UserService } from "@/modules/logic/user-logic";

// Custom error classes
class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User with ID ${userId} not found`);
    this.name = "UserNotFoundError";
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

// Usage in application
async function handleUserUpdate(userId: string, data: UpdateUserInput) {
  try {
    const user = await userService.updateUser(userId, data);
    return { success: true, data: user };
  } catch (error) {
    if (error.message.includes("not found")) {
      return {
        success: false,
        error: "USER_NOT_FOUND",
        message: "The requested user does not exist",
      };
    }

    if (error.message.includes("Validation failed")) {
      return {
        success: false,
        error: "VALIDATION_ERROR",
        message: error.message,
      };
    }

    // Log unexpected errors
    console.error("Unexpected error:", error);

    return {
      success: false,
      error: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
    };
  }
}
```

## Testing

### Running Tests

```bash
# Run all tests for this module
npm test -- modules/logic/user-logic

# Watch mode
npm test -- --watch modules/logic/user-logic

# Coverage report
npm test -- --coverage modules/logic/user-logic
```

### Unit Testing Services

```typescript
import { UserService } from "@/modules/logic/user-logic";
import type {
  IUserRepository,
  IUserValidation,
} from "@/modules/logic/user-logic";

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockValidation: jest.Mocked<IUserValidation>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockValidation = {
      validateCreateInput: jest.fn(),
      validateUpdateInput: jest.fn(),
      validateEmail: jest.fn(),
    };

    userService = new UserService(mockRepository, mockValidation);
  });

  describe("getUserById", () => {
    it("should get user by id", async () => {
      const mockUser = {
        id: "1",
        name: "John Doe",
        email: "john@example.com",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(mockUser);

      const user = await userService.getUserById("1");

      expect(user).toEqual(mockUser);
      expect(mockRepository.findById).toHaveBeenCalledWith("1");
    });

    it("should throw error for empty id", async () => {
      await expect(userService.getUserById("")).rejects.toThrow(
        "User ID is required",
      );
    });

    it("should return null when user not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const user = await userService.getUserById("999");

      expect(user).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create user successfully", async () => {
      const input = {
        email: "john@example.com",
        name: "John Doe",
        bio: "Developer",
      };

      const mockCreatedUser = {
        id: "1",
        ...input,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockValidation.validateCreateInput.mockResolvedValue();
      mockRepository.create.mockResolvedValue(mockCreatedUser);

      const user = await userService.createUser(input);

      expect(mockValidation.validateCreateInput).toHaveBeenCalledWith(input);
      expect(mockRepository.create).toHaveBeenCalledWith(input);
      expect(user).toEqual(mockCreatedUser);
    });

    it("should throw validation error", async () => {
      const input = {
        email: "invalid",
        name: "Jo",
        bio: "Developer",
      };

      mockValidation.validateCreateInput.mockRejectedValue(
        new Error("Validation failed: Invalid email format"),
      );

      await expect(userService.createUser(input)).rejects.toThrow(
        "Validation failed",
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("updateUser", () => {
    it("should update user successfully", async () => {
      const userId = "1";
      const input = { name: "Updated Name" };

      const existingUser = {
        id: userId,
        email: "john@example.com",
        name: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = { ...existingUser, ...input };

      mockRepository.findById.mockResolvedValue(existingUser);
      mockValidation.validateUpdateInput.mockResolvedValue();
      mockRepository.update.mockResolvedValue(updatedUser);

      const user = await userService.updateUser(userId, input);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockValidation.validateUpdateInput).toHaveBeenCalledWith(input);
      expect(mockRepository.update).toHaveBeenCalledWith(userId, input);
      expect(user.name).toBe("Updated Name");
    });

    it("should throw error when user not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        userService.updateUser("999", { name: "New Name" }),
      ).rejects.toThrow("User not found");

      expect(mockValidation.validateUpdateInput).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      const userId = "1";

      const existingUser = {
        id: userId,
        email: "john@example.com",
        name: "John Doe",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findById.mockResolvedValue(existingUser);
      mockRepository.delete.mockResolvedValue();

      await userService.deleteUser(userId);

      expect(mockRepository.findById).toHaveBeenCalledWith(userId);
      expect(mockRepository.delete).toHaveBeenCalledWith(userId);
    });

    it("should throw error when user not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser("999")).rejects.toThrow(
        "User not found",
      );

      expect(mockRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("getUsers", () => {
    it("should get users with default filters", async () => {
      const mockResponse = {
        users: [
          {
            id: "1",
            email: "john@example.com",
            name: "John Doe",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        total: 1,
        hasMore: false,
      };

      mockRepository.findMany.mockResolvedValue(mockResponse);

      const response = await userService.getUsers();

      expect(mockRepository.findMany).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      expect(response).toEqual(mockResponse);
    });

    it("should get users with custom filters", async () => {
      const filter = {
        search: "john",
        sortBy: "name" as const,
        sortOrder: "asc" as const,
        limit: 10,
        offset: 5,
      };

      const mockResponse = {
        users: [],
        total: 50,
        hasMore: true,
      };

      mockRepository.findMany.mockResolvedValue(mockResponse);

      const response = await userService.getUsers(filter);

      expect(mockRepository.findMany).toHaveBeenCalledWith(filter);
      expect(response.total).toBe(50);
      expect(response.hasMore).toBe(true);
    });
  });
});
```

### Testing Validation

```typescript
import { UserValidation } from "@/modules/logic/user-logic";

describe("UserValidation", () => {
  let validation: UserValidation;

  beforeEach(() => {
    validation = new UserValidation();
  });

  describe("validateCreateInput", () => {
    it("should pass valid input", async () => {
      const input = {
        email: "john@example.com",
        name: "John Doe",
        bio: "Developer",
      };

      await expect(
        validation.validateCreateInput(input),
      ).resolves.not.toThrow();
    });

    it("should reject invalid email", async () => {
      const input = {
        email: "invalid-email",
        name: "John Doe",
      };

      await expect(validation.validateCreateInput(input)).rejects.toThrow(
        "Invalid email format",
      );
    });

    it("should reject short name", async () => {
      const input = {
        email: "john@example.com",
        name: "J",
      };

      await expect(validation.validateCreateInput(input)).rejects.toThrow(
        "Name must be at least 2 characters",
      );
    });

    it("should reject long bio", async () => {
      const input = {
        email: "john@example.com",
        name: "John Doe",
        bio: "a".repeat(501),
      };

      await expect(validation.validateCreateInput(input)).rejects.toThrow(
        "Bio must be less than 500 characters",
      );
    });
  });

  describe("validateEmail", () => {
    it("should validate correct email", () => {
      expect(validation.validateEmail("test@example.com")).toBe(true);
    });

    it("should reject invalid email", () => {
      expect(validation.validateEmail("invalid")).toBe(false);
      expect(validation.validateEmail("test@")).toBe(false);
      expect(validation.validateEmail("@example.com")).toBe(false);
    });
  });
});
```

## Integration with Other Modules

### With user-profile-ui Module

```typescript
// In your app setup
import { UserService, UserValidation } from "@/modules/logic/user-logic";
import { useUsers } from "@/modules/ui/user-profile-ui";

// Create repository (from user-data module when available)
const repository = new SupabaseUserRepository();
const validation = new UserValidation();
export const userService = new UserService(repository, validation);

// Then in UI hooks, replace mock with:
import { userService } from "@/services/user.service";

const result = await userService.getUsers(filter);
```

## Best Practices

1. **Always use interfaces**: Depend on IUserRepository and IUserValidation, never on concrete classes
2. **Inject dependencies**: Pass repository and validation to constructor
3. **Keep business logic in service**: Don't put business logic in repository or UI
4. **Validate before persist**: Always call validation before repository methods
5. **Handle errors gracefully**: Catch and transform errors appropriately
6. **Use types strictly**: Leverage TypeScript for type safety

## Migration from Legacy Code

If you have existing user service code:

1. Create repository implementation from your current data access code
2. Implement IUserRepository interface
3. Move validation logic to UserValidation or custom implementation
4. Instantiate UserService with your implementations
5. Replace direct service calls with new UserService instance

## Contributing

When contributing to this module:

1. Maintain SOLID principles strictly
2. Update interfaces carefully (may break implementations)
3. Add tests for new functionality
4. Document all public methods
5. Update module.json when adding exports
6. Run `npm run modules:sync` after changes

## License

MIT

---

**Module Version**: 1.0.0
**Last Updated**: 2025-01-11
**Status**: Stable
