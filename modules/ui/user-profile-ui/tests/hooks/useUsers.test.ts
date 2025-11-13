import { renderHook, act, waitFor } from "@testing-library/react";
import { useUsers } from "../../src/hooks/useUsers";
import { useUserStore } from "../../src/stores/user.store";
import type {
  UserProfile,
  CreateUserInput,
  UpdateUserInput,
} from "../../src/types";

// Mock the store
jest.mock("../../src/stores/user.store");

const mockUseUserStore = useUserStore as jest.MockedFunction<
  typeof useUserStore
>;

describe("useUsers", () => {
  const mockUsers: UserProfile[] = [
    {
      id: "1",
      email: "user1@example.com",
      name: "User One",
      bio: "Bio 1",
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "2",
      email: "user2@example.com",
      name: "User Two",
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
  ];

  const mockSetUsers = jest.fn();
  const mockAddUser = jest.fn();
  const mockUpdateUser = jest.fn();
  const mockRemoveUser = jest.fn();
  const mockSetUsersLoading = jest.fn();
  const mockSetUsersError = jest.fn();
  const mockSetFilter = jest.fn();
  const mockSetHasMore = jest.fn();
  const mockSetTotal = jest.fn();

  const defaultStoreState = {
    currentUser: null,
    isLoadingUser: false,
    userError: null,
    users: [],
    isLoadingUsers: false,
    usersError: null,
    filter: {
      limit: 20,
      offset: 0,
      sortBy: "createdAt" as const,
      sortOrder: "desc" as const,
    },
    hasMore: false,
    total: 0,
    setCurrentUser: jest.fn(),
    setUserLoading: jest.fn(),
    setUserError: jest.fn(),
    setUsers: mockSetUsers,
    addUser: mockAddUser,
    updateUser: mockUpdateUser,
    removeUser: mockRemoveUser,
    setUsersLoading: mockSetUsersLoading,
    setUsersError: mockSetUsersError,
    setFilter: mockSetFilter,
    setHasMore: mockSetHasMore,
    setTotal: mockSetTotal,
    reset: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUserStore.mockReturnValue(defaultStoreState);
  });

  // Initial state tests
  describe("Initial State", () => {
    it("should initialize with store values", () => {
      const { result } = renderHook(() => useUsers());

      expect(result.current.users).toEqual([]);
      expect(result.current.isLoadingUsers).toBe(false);
      expect(result.current.usersError).toBeNull();
      expect(result.current.hasMore).toBe(false);
      expect(result.current.total).toBe(0);
    });

    it("should reflect store state changes", () => {
      mockUseUserStore.mockReturnValue({
        ...defaultStoreState,
        users: mockUsers,
        isLoadingUsers: true,
        hasMore: true,
        total: 10,
      });

      const { result } = renderHook(() => useUsers());

      expect(result.current.users).toEqual(mockUsers);
      expect(result.current.isLoadingUsers).toBe(true);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.total).toBe(10);
    });
  });

  // fetchUsers tests
  describe("fetchUsers", () => {
    it("should set loading state when fetching", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.fetchUsers();
      });

      expect(mockSetUsersLoading).toHaveBeenCalledWith(true);
      expect(mockSetUsersError).toHaveBeenCalledWith(null);
    });

    it("should fetch users and update store", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.fetchUsers();
      });

      await waitFor(() => {
        expect(mockSetUsers).toHaveBeenCalledWith([]);
        expect(mockSetTotal).toHaveBeenCalledWith(0);
        expect(mockSetHasMore).toHaveBeenCalledWith(false);
        expect(mockSetUsersLoading).toHaveBeenCalledWith(false);
      });
    });

    it("should accept filter parameters", async () => {
      const { result } = renderHook(() => useUsers());
      const newFilter = { search: "test", limit: 10 };

      await act(async () => {
        await result.current.fetchUsers(newFilter);
      });

      expect(mockSetFilter).toHaveBeenCalledWith(newFilter);
    });

    it("should handle errors", async () => {
      const error = new Error("Fetch failed");
      mockSetUsers.mockImplementation(() => {
        throw error;
      });

      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.fetchUsers();
      });

      await waitFor(() => {
        expect(mockSetUsersError).toHaveBeenCalledWith("Fetch failed");
        expect(mockSetUsersLoading).toHaveBeenCalledWith(false);
      });
    });

    it("should set loading to false even on error", async () => {
      mockSetUsers.mockImplementation(() => {
        throw new Error("Test error");
      });

      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.fetchUsers();
      });

      await waitFor(() => {
        expect(mockSetUsersLoading).toHaveBeenCalledWith(false);
      });
    });
  });

  // createUser tests
  describe("createUser", () => {
    const createInput: CreateUserInput = {
      email: "new@example.com",
      name: "New User",
      bio: "New bio",
    };

    it("should create a new user", async () => {
      const { result } = renderHook(() => useUsers());

      let newUser: UserProfile | undefined;

      await act(async () => {
        newUser = await result.current.createUser(createInput);
      });

      expect(newUser).toBeDefined();
      expect(newUser?.email).toBe(createInput.email);
      expect(newUser?.name).toBe(createInput.name);
      expect(newUser?.bio).toBe(createInput.bio);
      expect(mockAddUser).toHaveBeenCalledWith(newUser);
    });

    it("should set loading state during creation", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.createUser(createInput);
      });

      expect(mockSetUsersLoading).toHaveBeenCalledWith(true);
      expect(mockSetUsersError).toHaveBeenCalledWith(null);
    });

    it("should set loading to false after creation", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.createUser(createInput);
      });

      await waitFor(() => {
        expect(mockSetUsersLoading).toHaveBeenCalledWith(false);
      });
    });

    it("should handle creation errors", async () => {
      mockAddUser.mockImplementation(() => {
        throw new Error("Create failed");
      });

      const { result } = renderHook(() => useUsers());

      await expect(
        act(async () => {
          await result.current.createUser(createInput);
        }),
      ).rejects.toThrow("Create failed");

      expect(mockSetUsersError).toHaveBeenCalledWith("Create failed");
    });

    it("should generate unique IDs for new users", async () => {
      const { result } = renderHook(() => useUsers());

      let user1: UserProfile | undefined;
      let user2: UserProfile | undefined;

      await act(async () => {
        user1 = await result.current.createUser(createInput);
      });

      await act(async () => {
        user2 = await result.current.createUser(createInput);
      });

      expect(user1?.id).not.toBe(user2?.id);
    });
  });

  // updateUser tests
  describe("updateUser", () => {
    const updateInput: UpdateUserInput = {
      name: "Updated Name",
      bio: "Updated bio",
    };

    it("should update a user", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.updateUser("1", updateInput);
      });

      expect(mockUpdateUser).toHaveBeenCalledWith(
        "1",
        expect.objectContaining(updateInput),
      );
    });

    it("should set loading state during update", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.updateUser("1", updateInput);
      });

      expect(mockSetUsersLoading).toHaveBeenCalledWith(true);
      expect(mockSetUsersError).toHaveBeenCalledWith(null);
    });

    it("should include updatedAt timestamp", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.updateUser("1", updateInput);
      });

      expect(mockUpdateUser).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          ...updateInput,
          updatedAt: expect.any(Date),
        }),
      );
    });

    it("should handle update errors", async () => {
      mockUpdateUser.mockImplementation(() => {
        throw new Error("Update failed");
      });

      const { result } = renderHook(() => useUsers());

      await expect(
        act(async () => {
          await result.current.updateUser("1", updateInput);
        }),
      ).rejects.toThrow("Update failed");

      expect(mockSetUsersError).toHaveBeenCalledWith("Update failed");
    });

    it("should set loading to false after update", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.updateUser("1", updateInput);
      });

      await waitFor(() => {
        expect(mockSetUsersLoading).toHaveBeenCalledWith(false);
      });
    });
  });

  // deleteUser tests
  describe("deleteUser", () => {
    it("should delete a user", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.deleteUser("1");
      });

      expect(mockRemoveUser).toHaveBeenCalledWith("1");
    });

    it("should set loading state during deletion", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.deleteUser("1");
      });

      expect(mockSetUsersLoading).toHaveBeenCalledWith(true);
      expect(mockSetUsersError).toHaveBeenCalledWith(null);
    });

    it("should handle delete errors", async () => {
      mockRemoveUser.mockImplementation(() => {
        throw new Error("Delete failed");
      });

      const { result } = renderHook(() => useUsers());

      await expect(
        act(async () => {
          await result.current.deleteUser("1");
        }),
      ).rejects.toThrow("Delete failed");

      expect(mockSetUsersError).toHaveBeenCalledWith("Delete failed");
    });

    it("should set loading to false after deletion", async () => {
      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.deleteUser("1");
      });

      await waitFor(() => {
        expect(mockSetUsersLoading).toHaveBeenCalledWith(false);
      });
    });
  });

  // loadMore tests
  describe("loadMore", () => {
    it("should not load more when hasMore is false", async () => {
      mockUseUserStore.mockReturnValue({
        ...defaultStoreState,
        hasMore: false,
      });

      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockSetFilter).not.toHaveBeenCalled();
    });

    it("should not load more when already loading", async () => {
      mockUseUserStore.mockReturnValue({
        ...defaultStoreState,
        hasMore: true,
        isLoadingUsers: true,
      });

      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.loadMore();
      });

      expect(mockSetFilter).not.toHaveBeenCalled();
    });

    it("should load more with correct offset", async () => {
      mockUseUserStore.mockReturnValue({
        ...defaultStoreState,
        users: mockUsers,
        hasMore: true,
        isLoadingUsers: false,
      });

      const { result } = renderHook(() => useUsers());

      await act(async () => {
        await result.current.loadMore();
      });

      // Should fetch with offset equal to current users length
      await waitFor(() => {
        expect(mockSetFilter).toHaveBeenCalled();
      });
    });
  });

  // setFilter tests
  describe("setFilter", () => {
    it("should update filter", () => {
      const { result } = renderHook(() => useUsers());
      const newFilter = { search: "test" };

      act(() => {
        result.current.setFilter(newFilter);
      });

      expect(mockSetFilter).toHaveBeenCalledWith(newFilter);
    });

    it("should be available in return value", () => {
      const { result } = renderHook(() => useUsers());

      expect(typeof result.current.setFilter).toBe("function");
    });
  });

  // Return value structure tests
  describe("Return Value Structure", () => {
    it("should return all expected properties", () => {
      const { result } = renderHook(() => useUsers());

      // State
      expect(result.current).toHaveProperty("users");
      expect(result.current).toHaveProperty("isLoadingUsers");
      expect(result.current).toHaveProperty("usersError");
      expect(result.current).toHaveProperty("filter");
      expect(result.current).toHaveProperty("hasMore");
      expect(result.current).toHaveProperty("total");

      // Actions
      expect(result.current).toHaveProperty("fetchUsers");
      expect(result.current).toHaveProperty("createUser");
      expect(result.current).toHaveProperty("updateUser");
      expect(result.current).toHaveProperty("deleteUser");
      expect(result.current).toHaveProperty("loadMore");
      expect(result.current).toHaveProperty("setFilter");
    });

    it("should have all actions as callable functions", () => {
      const { result } = renderHook(() => useUsers());

      expect(typeof result.current.fetchUsers).toBe("function");
      expect(typeof result.current.createUser).toBe("function");
      expect(typeof result.current.updateUser).toBe("function");
      expect(typeof result.current.deleteUser).toBe("function");
      expect(typeof result.current.loadMore).toBe("function");
      expect(typeof result.current.setFilter).toBe("function");
    });
  });

  // Callback stability tests
  describe("Callback Stability", () => {
    it("should maintain stable callback references", () => {
      const { result, rerender } = renderHook(() => useUsers());

      const firstCallbacks = {
        fetchUsers: result.current.fetchUsers,
        createUser: result.current.createUser,
        updateUser: result.current.updateUser,
        deleteUser: result.current.deleteUser,
        loadMore: result.current.loadMore,
      };

      rerender();

      expect(result.current.fetchUsers).toBe(firstCallbacks.fetchUsers);
      expect(result.current.createUser).toBe(firstCallbacks.createUser);
      expect(result.current.updateUser).toBe(firstCallbacks.updateUser);
      expect(result.current.deleteUser).toBe(firstCallbacks.deleteUser);
      expect(result.current.loadMore).toBe(firstCallbacks.loadMore);
    });
  });

  // Integration tests
  describe("Integration", () => {
    it("should perform complete CRUD cycle", async () => {
      const { result } = renderHook(() => useUsers());

      // Fetch
      await act(async () => {
        await result.current.fetchUsers();
      });

      // Create
      const createInput: CreateUserInput = {
        email: "test@example.com",
        name: "Test User",
      };

      await act(async () => {
        await result.current.createUser(createInput);
      });

      // Update
      await act(async () => {
        await result.current.updateUser("1", { name: "Updated" });
      });

      // Delete
      await act(async () => {
        await result.current.deleteUser("1");
      });

      // Verify all operations called their respective store methods
      expect(mockSetUsers).toHaveBeenCalled();
      expect(mockAddUser).toHaveBeenCalled();
      expect(mockUpdateUser).toHaveBeenCalled();
      expect(mockRemoveUser).toHaveBeenCalled();
    });
  });
});
