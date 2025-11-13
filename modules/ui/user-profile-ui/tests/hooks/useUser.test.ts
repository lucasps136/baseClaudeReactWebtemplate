import { renderHook, act, waitFor } from "@testing-library/react";
import { useUser } from "../../src/hooks/useUser";
import { useUserStore } from "../../src/stores/user.store";
import type { UserProfile } from "../../src/types";

// Mock the store
jest.mock("../../src/stores/user.store");

const mockUseUserStore = useUserStore as jest.MockedFunction<
  typeof useUserStore
>;

describe("useUser", () => {
  const mockUser: UserProfile = {
    id: "123",
    email: "test@example.com",
    name: "Test User",
    bio: "Test bio",
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  const mockSetCurrentUser = jest.fn();
  const mockSetUserLoading = jest.fn();
  const mockSetUserError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseUserStore.mockReturnValue({
      currentUser: null,
      isLoadingUser: false,
      userError: null,
      users: [],
      isLoadingUsers: false,
      usersError: null,
      filter: { limit: 20, offset: 0, sortBy: "createdAt", sortOrder: "desc" },
      hasMore: false,
      total: 0,
      setCurrentUser: mockSetCurrentUser,
      setUserLoading: mockSetUserLoading,
      setUserError: mockSetUserError,
      setUsers: jest.fn(),
      addUser: jest.fn(),
      updateUser: jest.fn(),
      removeUser: jest.fn(),
      setUsersLoading: jest.fn(),
      setUsersError: jest.fn(),
      setFilter: jest.fn(),
      setHasMore: jest.fn(),
      setTotal: jest.fn(),
      reset: jest.fn(),
    });
  });

  // Initial state tests
  describe("Initial State", () => {
    it("should initialize with store values", () => {
      const { result } = renderHook(() => useUser());

      expect(result.current.currentUser).toBeNull();
      expect(result.current.isLoadingUser).toBe(false);
      expect(result.current.userError).toBeNull();
    });

    it("should reflect store state changes", () => {
      mockUseUserStore.mockReturnValue({
        currentUser: mockUser,
        isLoadingUser: true,
        userError: "Some error",
        users: [],
        isLoadingUsers: false,
        usersError: null,
        filter: {
          limit: 20,
          offset: 0,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
        hasMore: false,
        total: 0,
        setCurrentUser: mockSetCurrentUser,
        setUserLoading: mockSetUserLoading,
        setUserError: mockSetUserError,
        setUsers: jest.fn(),
        addUser: jest.fn(),
        updateUser: jest.fn(),
        removeUser: jest.fn(),
        setUsersLoading: jest.fn(),
        setUsersError: jest.fn(),
        setFilter: jest.fn(),
        setHasMore: jest.fn(),
        setTotal: jest.fn(),
        reset: jest.fn(),
      });

      const { result } = renderHook(() => useUser());

      expect(result.current.currentUser).toEqual(mockUser);
      expect(result.current.isLoadingUser).toBe(true);
      expect(result.current.userError).toBe("Some error");
    });
  });

  // fetchUser tests
  describe("fetchUser", () => {
    it("should set loading state when fetching user", async () => {
      const { result } = renderHook(() => useUser());

      act(() => {
        result.current.fetchUser("123");
      });

      expect(mockSetUserLoading).toHaveBeenCalledWith(true);
      expect(mockSetUserError).toHaveBeenCalledWith(null);
    });

    it("should set loading to false after fetch", async () => {
      const { result } = renderHook(() => useUser());

      await act(async () => {
        await result.current.fetchUser("123");
      });

      await waitFor(() => {
        expect(mockSetUserLoading).toHaveBeenCalledWith(false);
      });
    });

    it("should set current user to null (mock implementation)", async () => {
      const { result } = renderHook(() => useUser());

      await act(async () => {
        await result.current.fetchUser("123");
      });

      await waitFor(() => {
        expect(mockSetCurrentUser).toHaveBeenCalledWith(null);
      });
    });

    it("should return null for valid ID (mock implementation)", async () => {
      const { result } = renderHook(() => useUser());

      let returnValue: UserProfile | null = undefined as any;

      await act(async () => {
        returnValue = await result.current.fetchUser("123");
      });

      expect(returnValue).toBeNull();
    });

    it("should handle empty ID", async () => {
      const { result } = renderHook(() => useUser());

      let returnValue: UserProfile | null = undefined as any;

      await act(async () => {
        returnValue = await result.current.fetchUser("");
      });

      expect(mockSetUserError).toHaveBeenCalledWith("User ID is required");
      expect(returnValue).toBeNull();
      expect(mockSetUserLoading).not.toHaveBeenCalled();
    });

    it("should not call setCurrentUser when ID is empty", async () => {
      const { result } = renderHook(() => useUser());

      await act(async () => {
        await result.current.fetchUser("");
      });

      expect(mockSetCurrentUser).not.toHaveBeenCalled();
    });

    it("should maintain callback stability", () => {
      const { result, rerender } = renderHook(() => useUser());

      const firstFetchUser = result.current.fetchUser;

      rerender();

      expect(result.current.fetchUser).toBe(firstFetchUser);
    });
  });

  // clearUser tests
  describe("clearUser", () => {
    it("should clear current user", () => {
      const { result } = renderHook(() => useUser());

      act(() => {
        result.current.clearUser();
      });

      expect(mockSetCurrentUser).toHaveBeenCalledWith(null);
    });

    it("should clear user error", () => {
      const { result } = renderHook(() => useUser());

      act(() => {
        result.current.clearUser();
      });

      expect(mockSetUserError).toHaveBeenCalledWith(null);
    });

    it("should call both setters when clearing", () => {
      const { result } = renderHook(() => useUser());

      act(() => {
        result.current.clearUser();
      });

      expect(mockSetCurrentUser).toHaveBeenCalledTimes(1);
      expect(mockSetUserError).toHaveBeenCalledTimes(1);
    });

    it("should maintain callback stability", () => {
      const { result, rerender } = renderHook(() => useUser());

      const firstClearUser = result.current.clearUser;

      rerender();

      expect(result.current.clearUser).toBe(firstClearUser);
    });
  });

  // Return value structure tests
  describe("Return Value Structure", () => {
    it("should return all expected properties", () => {
      const { result } = renderHook(() => useUser());

      expect(result.current).toHaveProperty("currentUser");
      expect(result.current).toHaveProperty("isLoadingUser");
      expect(result.current).toHaveProperty("userError");
      expect(result.current).toHaveProperty("fetchUser");
      expect(result.current).toHaveProperty("clearUser");
    });

    it("should have functions as callable types", () => {
      const { result } = renderHook(() => useUser());

      expect(typeof result.current.fetchUser).toBe("function");
      expect(typeof result.current.clearUser).toBe("function");
    });
  });

  // Error handling tests
  describe("Error Handling", () => {
    it("should handle errors gracefully", async () => {
      const { result } = renderHook(() => useUser());

      await act(async () => {
        await result.current.fetchUser("invalid-id");
      });

      // Mock always returns null, but loading should be set to false
      await waitFor(() => {
        expect(mockSetUserLoading).toHaveBeenCalledWith(false);
      });
    });

    it("should clear error before fetching", async () => {
      const { result } = renderHook(() => useUser());

      await act(async () => {
        await result.current.fetchUser("123");
      });

      expect(mockSetUserError).toHaveBeenCalledWith(null);
    });
  });

  // Integration tests
  describe("Integration", () => {
    it("should perform complete fetch cycle", async () => {
      const { result } = renderHook(() => useUser());

      await act(async () => {
        await result.current.fetchUser("123");
      });

      // Verify the sequence of calls
      expect(mockSetUserLoading).toHaveBeenCalledWith(true);
      expect(mockSetUserError).toHaveBeenCalledWith(null);

      await waitFor(() => {
        expect(mockSetCurrentUser).toHaveBeenCalled();
        expect(mockSetUserLoading).toHaveBeenCalledWith(false);
      });
    });

    it("should allow clearing after fetching", async () => {
      const { result } = renderHook(() => useUser());

      await act(async () => {
        await result.current.fetchUser("123");
      });

      act(() => {
        result.current.clearUser();
      });

      expect(mockSetCurrentUser).toHaveBeenCalledWith(null);
      expect(mockSetUserError).toHaveBeenCalledWith(null);
    });
  });
});
