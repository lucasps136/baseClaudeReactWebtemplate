import { UserService } from "../../src/services/user.service";
import type { IUserRepository } from "../../src/repositories/user.repository.interface";
import type { IUserValidation } from "../../src/validations/user.validation";
import type {
  UserProfile,
  CreateUserInput,
  UpdateUserInput,
  UserListFilter,
  UserListResponse,
} from "../../src/types";

describe("UserService", () => {
  let userService: UserService;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockValidation: jest.Mocked<IUserValidation>;

  // Mock data
  const mockUser: UserProfile = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    avatar: "https://example.com/avatar.jpg",
    bio: "Test bio",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  const mockUserList: UserListResponse = {
    users: [mockUser],
    total: 1,
    hasMore: false,
  };

  beforeEach(() => {
    // Create mock repository
    mockRepository = {
      findById: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    // Create mock validation
    mockValidation = {
      validateCreateInput: jest.fn(),
      validateUpdateInput: jest.fn(),
      validateEmail: jest.fn(),
    };

    // Create service instance with mocks
    userService = new UserService(mockRepository, mockValidation);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // Constructor Tests
  // ============================================================================

  describe("Constructor", () => {
    it("should initialize with repository and validation dependencies", () => {
      expect(userService).toBeInstanceOf(UserService);
      expect(mockRepository).toBeDefined();
      expect(mockValidation).toBeDefined();
    });
  });

  // ============================================================================
  // getUserById Tests
  // ============================================================================

  describe("getUserById", () => {
    it("should get user by id successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockUser);

      const result = await userService.getUserById("user-123");

      expect(mockRepository.findById).toHaveBeenCalledWith("user-123");
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it("should return null when user not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      const result = await userService.getUserById("nonexistent");

      expect(mockRepository.findById).toHaveBeenCalledWith("nonexistent");
      expect(result).toBeNull();
    });

    it("should throw error when id is empty string", async () => {
      await expect(userService.getUserById("")).rejects.toThrow(
        "User ID is required",
      );

      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database connection failed");
      mockRepository.findById.mockRejectedValue(error);

      await expect(userService.getUserById("user-123")).rejects.toThrow(
        "Database connection failed",
      );
    });
  });

  // ============================================================================
  // getUsers Tests
  // ============================================================================

  describe("getUsers", () => {
    it("should get users with default filters", async () => {
      mockRepository.findMany.mockResolvedValue(mockUserList);

      const result = await userService.getUsers();

      expect(mockRepository.findMany).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      expect(result).toEqual(mockUserList);
    });

    it("should get users with custom filters", async () => {
      const customFilter: UserListFilter = {
        search: "test",
        sortBy: "name",
        sortOrder: "asc",
        limit: 10,
        offset: 5,
      };

      mockRepository.findMany.mockResolvedValue(mockUserList);

      const result = await userService.getUsers(customFilter);

      expect(mockRepository.findMany).toHaveBeenCalledWith(customFilter);
      expect(result).toEqual(mockUserList);
    });

    it("should merge custom filters with defaults", async () => {
      const partialFilter: UserListFilter = {
        search: "test",
        limit: 50,
      };

      mockRepository.findMany.mockResolvedValue(mockUserList);

      await userService.getUsers(partialFilter);

      expect(mockRepository.findMany).toHaveBeenCalledWith({
        search: "test",
        limit: 50,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });

    it("should handle empty result set", async () => {
      const emptyResponse: UserListResponse = {
        users: [],
        total: 0,
        hasMore: false,
      };
      mockRepository.findMany.mockResolvedValue(emptyResponse);

      const result = await userService.getUsers();

      expect(result.users).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it("should handle pagination correctly", async () => {
      const paginatedResponse: UserListResponse = {
        users: [mockUser],
        total: 100,
        hasMore: true,
      };
      mockRepository.findMany.mockResolvedValue(paginatedResponse);

      const result = await userService.getUsers({ limit: 10, offset: 10 });

      expect(result.hasMore).toBe(true);
      expect(result.total).toBe(100);
    });

    it("should handle repository errors", async () => {
      const error = new Error("Database error");
      mockRepository.findMany.mockRejectedValue(error);

      await expect(userService.getUsers()).rejects.toThrow("Database error");
    });
  });

  // ============================================================================
  // createUser Tests
  // ============================================================================

  describe("createUser", () => {
    const validInput: CreateUserInput = {
      email: "newuser@example.com",
      name: "New User",
      bio: "New user bio",
    };

    it("should create user successfully", async () => {
      mockValidation.validateCreateInput.mockResolvedValue(undefined);
      mockRepository.create.mockResolvedValue(mockUser);

      const result = await userService.createUser(validInput);

      expect(mockValidation.validateCreateInput).toHaveBeenCalledWith(
        validInput,
      );
      expect(mockValidation.validateCreateInput).toHaveBeenCalledTimes(1);
      expect(mockRepository.create).toHaveBeenCalledWith(validInput);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUser);
    });

    it("should validate input before creating", async () => {
      const callOrder: string[] = [];

      mockValidation.validateCreateInput.mockImplementation(async () => {
        callOrder.push("validate");
      });
      mockRepository.create.mockImplementation(async () => {
        callOrder.push("create");
        return mockUser;
      });

      await userService.createUser(validInput);

      expect(callOrder).toEqual(["validate", "create"]);
      expect(mockValidation.validateCreateInput).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
    });

    it("should throw error when validation fails", async () => {
      const validationError = new Error("Validation failed: Email is required");
      mockValidation.validateCreateInput.mockRejectedValue(validationError);

      await expect(userService.createUser(validInput)).rejects.toThrow(
        "Validation failed: Email is required",
      );

      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it("should create user without optional bio", async () => {
      const minimalInput: CreateUserInput = {
        email: "minimal@example.com",
        name: "Minimal User",
      };

      mockValidation.validateCreateInput.mockResolvedValue(undefined);
      mockRepository.create.mockResolvedValue(mockUser);

      await userService.createUser(minimalInput);

      expect(mockValidation.validateCreateInput).toHaveBeenCalledWith(
        minimalInput,
      );
      expect(mockRepository.create).toHaveBeenCalledWith(minimalInput);
    });

    it("should handle repository errors", async () => {
      mockValidation.validateCreateInput.mockResolvedValue(undefined);
      const error = new Error("Database constraint violation");
      mockRepository.create.mockRejectedValue(error);

      await expect(userService.createUser(validInput)).rejects.toThrow(
        "Database constraint violation",
      );
    });
  });

  // ============================================================================
  // updateUser Tests
  // ============================================================================

  describe("updateUser", () => {
    const validUpdate: UpdateUserInput = {
      name: "Updated Name",
      bio: "Updated bio",
    };

    it("should update user successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      const updatedUser = { ...mockUser, ...validUpdate };
      mockRepository.update.mockResolvedValue(updatedUser);

      const result = await userService.updateUser("user-123", validUpdate);

      expect(mockRepository.findById).toHaveBeenCalledWith("user-123");
      expect(mockValidation.validateUpdateInput).toHaveBeenCalledWith(
        validUpdate,
      );
      expect(mockRepository.update).toHaveBeenCalledWith(
        "user-123",
        validUpdate,
      );
      expect(result).toEqual(updatedUser);
    });

    it("should throw error when id is empty", async () => {
      await expect(userService.updateUser("", validUpdate)).rejects.toThrow(
        "User ID is required",
      );

      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockValidation.validateUpdateInput).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when user not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(
        userService.updateUser("nonexistent", validUpdate),
      ).rejects.toThrow("User not found");

      expect(mockRepository.findById).toHaveBeenCalledWith("nonexistent");
      expect(mockValidation.validateUpdateInput).not.toHaveBeenCalled();
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should validate input before updating", async () => {
      const callOrder: string[] = [];

      mockRepository.findById.mockResolvedValue(mockUser);
      mockValidation.validateUpdateInput.mockImplementation(async () => {
        callOrder.push("validate");
      });
      mockRepository.update.mockImplementation(async () => {
        callOrder.push("update");
        return mockUser;
      });

      await userService.updateUser("user-123", validUpdate);

      expect(callOrder).toEqual(["validate", "update"]);
      expect(mockValidation.validateUpdateInput).toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalled();
    });

    it("should throw error when validation fails", async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      const validationError = new Error("Validation failed: Name too short");
      mockValidation.validateUpdateInput.mockRejectedValue(validationError);

      await expect(
        userService.updateUser("user-123", validUpdate),
      ).rejects.toThrow("Validation failed: Name too short");

      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it("should update only provided fields", async () => {
      const partialUpdate: UpdateUserInput = {
        name: "Only Name Updated",
      };

      mockRepository.findById.mockResolvedValue(mockUser);
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      mockRepository.update.mockResolvedValue({
        ...mockUser,
        ...partialUpdate,
      });

      await userService.updateUser("user-123", partialUpdate);

      expect(mockRepository.update).toHaveBeenCalledWith(
        "user-123",
        partialUpdate,
      );
    });

    it("should update avatar URL", async () => {
      const avatarUpdate: UpdateUserInput = {
        avatar: "https://newavatar.com/image.jpg",
      };

      mockRepository.findById.mockResolvedValue(mockUser);
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      mockRepository.update.mockResolvedValue({ ...mockUser, ...avatarUpdate });

      const result = await userService.updateUser("user-123", avatarUpdate);

      expect(result.avatar).toBe("https://newavatar.com/image.jpg");
    });

    it("should handle repository errors", async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      const error = new Error("Update failed");
      mockRepository.update.mockRejectedValue(error);

      await expect(
        userService.updateUser("user-123", validUpdate),
      ).rejects.toThrow("Update failed");
    });
  });

  // ============================================================================
  // deleteUser Tests
  // ============================================================================

  describe("deleteUser", () => {
    it("should delete user successfully", async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      mockRepository.delete.mockResolvedValue(undefined);

      await userService.deleteUser("user-123");

      expect(mockRepository.findById).toHaveBeenCalledWith("user-123");
      expect(mockRepository.delete).toHaveBeenCalledWith("user-123");
      expect(mockRepository.delete).toHaveBeenCalledTimes(1);
    });

    it("should throw error when id is empty", async () => {
      await expect(userService.deleteUser("")).rejects.toThrow(
        "User ID is required",
      );

      expect(mockRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should throw error when user not found", async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(userService.deleteUser("nonexistent")).rejects.toThrow(
        "User not found",
      );

      expect(mockRepository.findById).toHaveBeenCalledWith("nonexistent");
      expect(mockRepository.delete).not.toHaveBeenCalled();
    });

    it("should verify user exists before deleting", async () => {
      const callOrder: string[] = [];

      mockRepository.findById.mockImplementation(async () => {
        callOrder.push("findById");
        return mockUser;
      });
      mockRepository.delete.mockImplementation(async () => {
        callOrder.push("delete");
      });

      await userService.deleteUser("user-123");

      expect(callOrder).toEqual(["findById", "delete"]);
      expect(mockRepository.findById).toHaveBeenCalled();
      expect(mockRepository.delete).toHaveBeenCalled();
    });

    it("should handle repository errors", async () => {
      mockRepository.findById.mockResolvedValue(mockUser);
      const error = new Error("Delete failed");
      mockRepository.delete.mockRejectedValue(error);

      await expect(userService.deleteUser("user-123")).rejects.toThrow(
        "Delete failed",
      );
    });
  });

  // ============================================================================
  // Integration Tests - Multiple Operations
  // ============================================================================

  describe("Integration Scenarios", () => {
    it("should handle create-read-update-delete flow", async () => {
      const createInput: CreateUserInput = {
        email: "flow@example.com",
        name: "Flow User",
      };

      // Create
      mockValidation.validateCreateInput.mockResolvedValue(undefined);
      mockRepository.create.mockResolvedValue(mockUser);
      const created = await userService.createUser(createInput);
      expect(created).toEqual(mockUser);

      // Read
      mockRepository.findById.mockResolvedValue(mockUser);
      const read = await userService.getUserById(mockUser.id);
      expect(read).toEqual(mockUser);

      // Update
      const updateInput: UpdateUserInput = { name: "Updated Flow User" };
      mockValidation.validateUpdateInput.mockResolvedValue(undefined);
      const updatedUser = { ...mockUser, ...updateInput };
      mockRepository.update.mockResolvedValue(updatedUser);
      const updated = await userService.updateUser(mockUser.id, updateInput);
      expect(updated.name).toBe("Updated Flow User");

      // Delete
      mockRepository.delete.mockResolvedValue(undefined);
      await expect(userService.deleteUser(mockUser.id)).resolves.not.toThrow();
    });

    it("should maintain data consistency across operations", async () => {
      const users: UserProfile[] = [mockUser];
      mockRepository.findMany.mockResolvedValue({
        users,
        total: 1,
        hasMore: false,
      });

      const listResult1 = await userService.getUsers();
      expect(listResult1.total).toBe(1);

      // Simulate adding a user
      const newUser = { ...mockUser, id: "user-456", name: "New User" };
      users.push(newUser);
      mockRepository.findMany.mockResolvedValue({
        users,
        total: 2,
        hasMore: false,
      });

      const listResult2 = await userService.getUsers();
      expect(listResult2.total).toBe(2);
    });
  });
});
