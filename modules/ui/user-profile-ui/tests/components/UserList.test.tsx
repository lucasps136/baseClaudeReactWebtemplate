import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { UserList } from "../../src/components/UserList";
import { useUsers } from "../../src/hooks/useUsers";
import type { UserProfile } from "../../src/types";

// Mock the useUsers hook
jest.mock("../../src/hooks/useUsers");

const mockUseUsers = useUsers as jest.MockedFunction<typeof useUsers>;

describe("UserList", () => {
  const mockUsers: UserProfile[] = [
    {
      id: "1",
      email: "user1@example.com",
      name: "User One",
      bio: "Bio for user one",
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

  const defaultMockReturn = {
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
    fetchUsers: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
    loadMore: jest.fn(),
    setFilter: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseUsers.mockReturnValue(defaultMockReturn);
  });

  // Rendering tests
  describe("Rendering", () => {
    it("should render loading state", () => {
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        isLoadingUsers: true,
      });

      render(<UserList />);
      expect(screen.getByText("Loading users...")).toBeInTheDocument();
    });

    it("should render error state", () => {
      const errorMessage = "Failed to fetch users";
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        usersError: errorMessage,
      });

      render(<UserList />);
      expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
    });

    it("should render empty state when no users", () => {
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        users: [],
      });

      render(<UserList />);
      expect(screen.getByText("No users found")).toBeInTheDocument();
    });

    it("should render users list", () => {
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        users: mockUsers,
      });

      render(<UserList />);

      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("User One")).toBeInTheDocument();
      expect(screen.getByText("user1@example.com")).toBeInTheDocument();
      expect(screen.getByText("Bio for user one")).toBeInTheDocument();
      expect(screen.getByText("User Two")).toBeInTheDocument();
      expect(screen.getByText("user2@example.com")).toBeInTheDocument();
    });

    it("should render user without bio", () => {
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        users: [mockUsers[1]], // User Two doesn't have bio
      });

      render(<UserList />);

      expect(screen.getByText("User Two")).toBeInTheDocument();
      expect(screen.queryByText(/Bio/)).not.toBeInTheDocument();
    });

    it("should render with custom className", () => {
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        users: mockUsers,
      });

      const { container } = render(<UserList className="custom-class" />);
      const wrapper = container.querySelector(".custom-class");
      expect(wrapper).toBeInTheDocument();
    });
  });

  // Effect tests
  describe("Effects", () => {
    it("should call fetchUsers on mount", () => {
      const mockFetchUsers = jest.fn();
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        fetchUsers: mockFetchUsers,
      });

      render(<UserList />);

      expect(mockFetchUsers).toHaveBeenCalledTimes(1);
    });
  });

  // Interaction tests
  describe("User Interactions", () => {
    it("should call deleteUser when delete button is clicked", () => {
      const mockDeleteUser = jest.fn();
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        users: mockUsers,
        deleteUser: mockDeleteUser,
      });

      render(<UserList />);

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[0]);

      expect(mockDeleteUser).toHaveBeenCalledWith("1");
      expect(mockDeleteUser).toHaveBeenCalledTimes(1);
    });

    it("should call deleteUser for correct user", () => {
      const mockDeleteUser = jest.fn();
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        users: mockUsers,
        deleteUser: mockDeleteUser,
      });

      render(<UserList />);

      const deleteButtons = screen.getAllByText("Delete");
      fireEvent.click(deleteButtons[1]); // Delete second user

      expect(mockDeleteUser).toHaveBeenCalledWith("2");
    });
  });

  // State transition tests
  describe("State Transitions", () => {
    it("should transition from loading to success", async () => {
      const mockFetchUsers = jest.fn();

      // First render - loading
      const { rerender } = render(<UserList />);
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        isLoadingUsers: true,
        fetchUsers: mockFetchUsers,
      });
      rerender(<UserList />);

      expect(screen.getByText("Loading users...")).toBeInTheDocument();

      // Second render - loaded
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        users: mockUsers,
        fetchUsers: mockFetchUsers,
      });
      rerender(<UserList />);

      expect(screen.queryByText("Loading users...")).not.toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
    });

    it("should transition from loading to error", () => {
      const mockFetchUsers = jest.fn();

      // First render - loading
      const { rerender } = render(<UserList />);
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        isLoadingUsers: true,
        fetchUsers: mockFetchUsers,
      });
      rerender(<UserList />);

      // Second render - error
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        usersError: "Network error",
        fetchUsers: mockFetchUsers,
      });
      rerender(<UserList />);

      expect(screen.getByText("Error: Network error")).toBeInTheDocument();
    });
  });

  // Accessibility tests
  describe("Accessibility", () => {
    it("should have proper heading structure", () => {
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        users: mockUsers,
      });

      render(<UserList />);

      const heading = screen.getByRole("heading", { level: 2, name: "Users" });
      expect(heading).toBeInTheDocument();
    });

    it("should have clickable delete buttons", () => {
      mockUseUsers.mockReturnValue({
        ...defaultMockReturn,
        users: mockUsers,
      });

      render(<UserList />);

      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });
      expect(deleteButtons).toHaveLength(2);
      deleteButtons.forEach((button) => {
        expect(button).toBeEnabled();
      });
    });
  });
});
