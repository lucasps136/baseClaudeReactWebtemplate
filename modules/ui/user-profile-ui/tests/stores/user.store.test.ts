import { renderHook, act } from "@testing-library/react";
import { useUserStore } from "../../src/stores/user.store";
import type { UserProfile } from "../../src/types";

describe("useUserStore", () => {
  const mockUser: UserProfile = {
    id: "1",
    email: "test@example.com",
    name: "Test User",
    bio: "Test bio",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  const mockUser2: UserProfile = {
    id: "2",
    email: "test2@example.com",
    name: "Test User 2",
    createdAt: new Date("2024-01-02"),
    updatedAt: new Date("2024-01-02"),
  };

  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useUserStore());
    act(() => {
      result.current.reset();
    });
  });

  // Initial state tests
  describe("Initial State", () => {
    it("should have correct initial state for single user", () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.currentUser).toBeNull();
      expect(result.current.isLoadingUser).toBe(false);
      expect(result.current.userError).toBeNull();
    });

    it("should have correct initial state for user list", () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.users).toEqual([]);
      expect(result.current.isLoadingUsers).toBe(false);
      expect(result.current.usersError).toBeNull();
      expect(result.current.hasMore).toBe(false);
      expect(result.current.total).toBe(0);
    });

    it("should have correct initial filter", () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current.filter).toEqual({
        limit: 20,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
    });
  });

  // Single user actions tests
  describe("Single User Actions", () => {
    it("should set current user", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
      });

      expect(result.current.currentUser).toEqual(mockUser);
      expect(result.current.userError).toBeNull();
    });

    it("should clear current user", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
      });

      expect(result.current.currentUser).toEqual(mockUser);

      act(() => {
        result.current.setCurrentUser(null);
      });

      expect(result.current.currentUser).toBeNull();
    });

    it("should set user loading state", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setUserLoading(true);
      });

      expect(result.current.isLoadingUser).toBe(true);

      act(() => {
        result.current.setUserLoading(false);
      });

      expect(result.current.isLoadingUser).toBe(false);
    });

    it("should set user error", () => {
      const { result } = renderHook(() => useUserStore());
      const errorMessage = "User not found";

      act(() => {
        result.current.setUserError(errorMessage);
      });

      expect(result.current.userError).toBe(errorMessage);
    });

    it("should clear user error", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setUserError("Error");
      });

      expect(result.current.userError).toBe("Error");

      act(() => {
        result.current.setUserError(null);
      });

      expect(result.current.userError).toBeNull();
    });
  });

  // List actions tests
  describe("List Actions", () => {
    it("should set users list", () => {
      const { result } = renderHook(() => useUserStore());
      const users = [mockUser, mockUser2];

      act(() => {
        result.current.setUsers(users);
      });

      expect(result.current.users).toEqual(users);
      expect(result.current.usersError).toBeNull();
    });

    it("should add user to list", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addUser(mockUser);
      });

      expect(result.current.users).toContainEqual(mockUser);
      expect(result.current.users).toHaveLength(1);
    });

    it("should add multiple users", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.addUser(mockUser);
      });

      act(() => {
        result.current.addUser(mockUser2);
      });

      expect(result.current.users).toHaveLength(2);
      expect(result.current.users).toContainEqual(mockUser);
      expect(result.current.users).toContainEqual(mockUser2);
    });

    it("should update user in list", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setUsers([mockUser, mockUser2]);
      });

      const updates = { name: "Updated Name", bio: "Updated bio" };

      act(() => {
        result.current.updateUser("1", updates);
      });

      expect(result.current.users[0].name).toBe("Updated Name");
      expect(result.current.users[0].bio).toBe("Updated bio");
      expect(result.current.users[1]).toEqual(mockUser2); // Other user unchanged
    });

    it("should not modify list when updating non-existent user", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setUsers([mockUser]);
      });

      act(() => {
        result.current.updateUser("999", { name: "Updated" });
      });

      expect(result.current.users).toEqual([mockUser]);
    });

    it("should update current user when it matches updated user", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setUsers([mockUser]);
      });

      const updates = { name: "Updated Current User" };

      act(() => {
        result.current.updateUser("1", updates);
      });

      expect(result.current.currentUser?.name).toBe("Updated Current User");
    });

    it("should not update current user when IDs do not match", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setUsers([mockUser, mockUser2]);
      });

      act(() => {
        result.current.updateUser("2", { name: "Updated" });
      });

      expect(result.current.currentUser).toEqual(mockUser);
    });

    it("should remove user from list", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setUsers([mockUser, mockUser2]);
      });

      expect(result.current.users).toHaveLength(2);

      act(() => {
        result.current.removeUser("1");
      });

      expect(result.current.users).toHaveLength(1);
      expect(result.current.users).not.toContainEqual(mockUser);
      expect(result.current.users).toContainEqual(mockUser2);
    });

    it("should clear current user when removing it", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setUsers([mockUser]);
      });

      act(() => {
        result.current.removeUser("1");
      });

      expect(result.current.currentUser).toBeNull();
    });

    it("should not clear current user when removing different user", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setUsers([mockUser, mockUser2]);
      });

      act(() => {
        result.current.removeUser("2");
      });

      expect(result.current.currentUser).toEqual(mockUser);
    });

    it("should set users loading state", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setUsersLoading(true);
      });

      expect(result.current.isLoadingUsers).toBe(true);

      act(() => {
        result.current.setUsersLoading(false);
      });

      expect(result.current.isLoadingUsers).toBe(false);
    });

    it("should set users error", () => {
      const { result } = renderHook(() => useUserStore());
      const errorMessage = "Failed to fetch users";

      act(() => {
        result.current.setUsersError(errorMessage);
      });

      expect(result.current.usersError).toBe(errorMessage);
    });

    it("should clear users error", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setUsersError("Error");
      });

      act(() => {
        result.current.setUsersError(null);
      });

      expect(result.current.usersError).toBeNull();
    });
  });

  // Filter and pagination tests
  describe("Filter and Pagination", () => {
    it("should update filter", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setFilter({ search: "test" });
      });

      expect(result.current.filter.search).toBe("test");
      expect(result.current.filter.limit).toBe(20); // Other properties unchanged
    });

    it("should update multiple filter properties", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setFilter({
          search: "test",
          limit: 10,
          sortBy: "name",
        });
      });

      expect(result.current.filter.search).toBe("test");
      expect(result.current.filter.limit).toBe(10);
      expect(result.current.filter.sortBy).toBe("name");
    });

    it("should set hasMore flag", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setHasMore(true);
      });

      expect(result.current.hasMore).toBe(true);

      act(() => {
        result.current.setHasMore(false);
      });

      expect(result.current.hasMore).toBe(false);
    });

    it("should set total count", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setTotal(100);
      });

      expect(result.current.total).toBe(100);
    });
  });

  // Reset tests
  describe("Reset", () => {
    it("should reset store to initial state", () => {
      const { result } = renderHook(() => useUserStore());

      // Modify state
      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setUsers([mockUser, mockUser2]);
        result.current.setUserError("Error 1");
        result.current.setUsersError("Error 2");
        result.current.setFilter({ search: "test" });
        result.current.setTotal(50);
        result.current.setHasMore(true);
      });

      // Verify state was modified
      expect(result.current.currentUser).toEqual(mockUser);
      expect(result.current.users).toHaveLength(2);

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify all state is back to initial
      expect(result.current.currentUser).toBeNull();
      expect(result.current.isLoadingUser).toBe(false);
      expect(result.current.userError).toBeNull();
      expect(result.current.users).toEqual([]);
      expect(result.current.isLoadingUsers).toBe(false);
      expect(result.current.usersError).toBeNull();
      expect(result.current.filter).toEqual({
        limit: 20,
        offset: 0,
        sortBy: "createdAt",
        sortOrder: "desc",
      });
      expect(result.current.hasMore).toBe(false);
      expect(result.current.total).toBe(0);
    });
  });

  // Complex scenarios tests
  describe("Complex Scenarios", () => {
    it("should handle simultaneous single and list operations", () => {
      const { result } = renderHook(() => useUserStore());

      act(() => {
        result.current.setCurrentUser(mockUser);
        result.current.setUsers([mockUser, mockUser2]);
      });

      expect(result.current.currentUser).toEqual(mockUser);
      expect(result.current.users).toHaveLength(2);
    });

    it("should maintain data consistency across operations", () => {
      const { result } = renderHook(() => useUserStore());

      // Initial setup
      act(() => {
        result.current.setUsers([mockUser, mockUser2]);
        result.current.setCurrentUser(mockUser);
      });

      // Update user in list
      act(() => {
        result.current.updateUser("1", { name: "Updated Name" });
      });

      // Both list and current user should be updated
      expect(result.current.users[0].name).toBe("Updated Name");
      expect(result.current.currentUser?.name).toBe("Updated Name");
    });

    it("should handle error clearing correctly", () => {
      const { result } = renderHook(() => useUserStore());

      // Set errors
      act(() => {
        result.current.setUserError("Single user error");
        result.current.setUsersError("List error");
      });

      expect(result.current.userError).toBe("Single user error");
      expect(result.current.usersError).toBe("List error");

      // Clear by setting successful data
      act(() => {
        result.current.setCurrentUser(mockUser);
      });

      expect(result.current.userError).toBeNull();
      expect(result.current.usersError).toBe("List error"); // Unchanged

      act(() => {
        result.current.setUsers([mockUser]);
      });

      expect(result.current.usersError).toBeNull();
    });

    it("should handle pagination scenario", () => {
      const { result } = renderHook(() => useUserStore());

      // First page
      act(() => {
        result.current.setUsers([mockUser]);
        result.current.setTotal(10);
        result.current.setHasMore(true);
        result.current.setFilter({ offset: 0, limit: 1 });
      });

      expect(result.current.users).toHaveLength(1);
      expect(result.current.hasMore).toBe(true);

      // Load more (second page)
      act(() => {
        result.current.setUsers([mockUser, mockUser2]);
        result.current.setFilter({ offset: 1, limit: 1 });
        result.current.setHasMore(false);
      });

      expect(result.current.users).toHaveLength(2);
      expect(result.current.hasMore).toBe(false);
    });
  });

  // Store structure tests
  describe("Store Structure", () => {
    it("should have all expected state properties", () => {
      const { result } = renderHook(() => useUserStore());

      expect(result.current).toHaveProperty("currentUser");
      expect(result.current).toHaveProperty("isLoadingUser");
      expect(result.current).toHaveProperty("userError");
      expect(result.current).toHaveProperty("users");
      expect(result.current).toHaveProperty("isLoadingUsers");
      expect(result.current).toHaveProperty("usersError");
      expect(result.current).toHaveProperty("filter");
      expect(result.current).toHaveProperty("hasMore");
      expect(result.current).toHaveProperty("total");
    });

    it("should have all expected action methods", () => {
      const { result } = renderHook(() => useUserStore());

      expect(typeof result.current.setCurrentUser).toBe("function");
      expect(typeof result.current.setUserLoading).toBe("function");
      expect(typeof result.current.setUserError).toBe("function");
      expect(typeof result.current.setUsers).toBe("function");
      expect(typeof result.current.addUser).toBe("function");
      expect(typeof result.current.updateUser).toBe("function");
      expect(typeof result.current.removeUser).toBe("function");
      expect(typeof result.current.setUsersLoading).toBe("function");
      expect(typeof result.current.setUsersError).toBe("function");
      expect(typeof result.current.setFilter).toBe("function");
      expect(typeof result.current.setHasMore).toBe("function");
      expect(typeof result.current.setTotal).toBe("function");
      expect(typeof result.current.reset).toBe("function");
    });
  });
});
