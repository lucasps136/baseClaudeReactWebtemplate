# User Profile UI Module

> Complete UI module for user profile management with components, hooks, stores and types

## Overview

This module provides a complete UI solution for user profile management, including:

- UserList component for displaying users
- Custom hooks for state management
- Zustand store for global user state
- TypeScript types for type safety

## Installation

This module is already part of the monorepo. No additional installation needed.

**Dependencies:**

- react
- zustand

## Usage

### Basic Example - UserList Component

```typescript
import { UserList } from '@/modules/ui/user-profile-ui'

function UsersPage() {
  return (
    <div>
      <h1>Users Management</h1>
      <UserList />
    </div>
  )
}
```

### Using Hooks

#### useUsers Hook

```typescript
import { useUsers } from '@/modules/ui/user-profile-ui'

function CustomUserList() {
  const {
    users,
    isLoadingUsers,
    usersError,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser
  } = useUsers()

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleCreateUser = async () => {
    await createUser({
      email: 'john@example.com',
      name: 'John Doe',
      bio: 'Software developer'
    })
  }

  return (
    <div>
      {isLoadingUsers && <p>Loading...</p>}
      {usersError && <p>Error: {usersError}</p>}
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <button onClick={handleCreateUser}>Create User</button>
    </div>
  )
}
```

#### useUser Hook

```typescript
import { useUser } from '@/modules/ui/user-profile-ui'

function UserProfile({ userId }: { userId: string }) {
  const { currentUser, isLoadingUser, fetchUser } = useUser()

  useEffect(() => {
    fetchUser(userId)
  }, [userId])

  if (isLoadingUser) return <p>Loading user...</p>

  return (
    <div>
      <h1>{currentUser?.name}</h1>
      <p>{currentUser?.email}</p>
    </div>
  )
}
```

### Direct Store Access

```typescript
import { useUserStore } from '@/modules/ui/user-profile-ui'

function UserCounter() {
  const total = useUserStore(state => state.total)
  return <p>Total users: {total}</p>
}
```

## API Reference

### Components

#### UserList

Displays a list of users with delete functionality.

**Props:**

| Prop      | Type   | Required | Default     | Description        |
| --------- | ------ | -------- | ----------- | ------------------ |
| className | string | No       | 'space-y-4' | Custom CSS classes |

**Example:**

```typescript
<UserList className="my-custom-class" />
```

### Hooks

#### useUser

Hook for managing single user state and operations.

**Returns:**

| Property      | Type                                         | Description             |
| ------------- | -------------------------------------------- | ----------------------- |
| currentUser   | UserProfile \| null                          | Currently selected user |
| isLoadingUser | boolean                                      | Loading state for user  |
| userError     | string \| null                               | Error message if any    |
| fetchUser     | (id: string) => Promise<UserProfile \| null> | Fetch user by ID        |
| clearUser     | () => void                                   | Clear current user      |

#### useUsers

Hook for managing user list state and CRUD operations.

**Returns:**

| Property       | Type                                                 | Description                      |
| -------------- | ---------------------------------------------------- | -------------------------------- |
| users          | UserProfile[]                                        | Array of users                   |
| isLoadingUsers | boolean                                              | Loading state for list           |
| usersError     | string \| null                                       | Error message if any             |
| filter         | UserListFilter                                       | Current filter settings          |
| hasMore        | boolean                                              | Whether more users available     |
| total          | number                                               | Total user count                 |
| fetchUsers     | (filter?) => Promise<void>                           | Fetch users with optional filter |
| createUser     | (input: CreateUserInput) => Promise<UserProfile>     | Create new user                  |
| updateUser     | (id: string, input: UpdateUserInput) => Promise<any> | Update user                      |
| deleteUser     | (id: string) => Promise<void>                        | Delete user                      |
| loadMore       | () => Promise<void>                                  | Load more users (pagination)     |
| setFilter      | (filter: Partial<UserListFilter>) => void            | Update filter                    |

### Types

#### UserProfile

```typescript
interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### CreateUserInput

```typescript
interface CreateUserInput {
  email: string;
  name: string;
  bio?: string;
}
```

#### UpdateUserInput

```typescript
interface UpdateUserInput {
  name?: string;
  bio?: string;
  avatar?: string;
}
```

#### UserListFilter

```typescript
interface UserListFilter {
  search?: string;
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}
```

### Store Shape

Complete Zustand store interface:

```typescript
interface UserStore {
  // Single user state
  currentUser: UserProfile | null;
  isLoadingUser: boolean;
  userError: string | null;

  // List state
  users: UserProfile[];
  isLoadingUsers: boolean;
  usersError: string | null;
  filter: UserListFilter;
  hasMore: boolean;
  total: number;

  // Single user actions
  setCurrentUser: (user: UserProfile | null) => void;
  setUserLoading: (loading: boolean) => void;
  setUserError: (error: string | null) => void;

  // List actions
  setUsers: (users: UserProfile[]) => void;
  addUser: (user: UserProfile) => void;
  updateUser: (id: string, updates: Partial<UserProfile>) => void;
  removeUser: (id: string) => void;
  setUsersLoading: (loading: boolean) => void;
  setUsersError: (error: string | null) => void;
  setFilter: (filter: Partial<UserListFilter>) => void;
  setHasMore: (hasMore: boolean) => void;
  setTotal: (total: number) => void;

  // Utility
  reset: () => void;
}
```

**Example - Direct Store Usage:**

```typescript
import { useUserStore } from '@/modules/ui/user-profile-ui'

function UserCounter() {
  const total = useUserStore((state) => state.total)
  const users = useUserStore((state) => state.users)

  return (
    <div>
      <p>Total users: {total}</p>
      <p>Loaded: {users.length}</p>
    </div>
  )
}
```

**Example - Store Actions:**

```typescript
function UserManager() {
  const addUser = useUserStore((state) => state.addUser)
  const removeUser = useUserStore((state) => state.removeUser)
  const updateUser = useUserStore((state) => state.updateUser)

  const handleAdd = () => {
    addUser({
      id: '123',
      email: 'new@example.com',
      name: 'New User',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  }

  const handleUpdate = () => {
    updateUser('123', { name: 'Updated Name' })
  }

  const handleRemove = () => {
    removeUser('123')
  }

  return (
    <div>
      <button onClick={handleAdd}>Add User</button>
      <button onClick={handleUpdate}>Update User</button>
      <button onClick={handleRemove}>Remove User</button>
    </div>
  )
}
```

## Examples

### Example 1: User Management Page

Complete example with list, create, and delete:

```typescript
import { UserList, useUsers } from '@/modules/ui/user-profile-ui'
import { useState } from 'react'

export function UsersPage() {
  const { createUser, isLoadingUsers } = useUsers()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await createUser({ email, name })
    setEmail('')
    setName('')
  }

  return (
    <div className="container">
      <h1>User Management</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
        />
        <button type="submit" disabled={isLoadingUsers}>
          Add User
        </button>
      </form>

      <UserList />
    </div>
  )
}
```

### Example 2: User Profile Detail

Using useUser hook for single user:

```typescript
import { useUser } from '@/modules/ui/user-profile-ui'
import { useEffect } from 'react'

export function UserProfile({ userId }: { userId: string }) {
  const { currentUser, isLoadingUser, userError, fetchUser } = useUser()

  useEffect(() => {
    fetchUser(userId)
  }, [userId])

  if (isLoadingUser) {
    return <div>Loading user profile...</div>
  }

  if (userError) {
    return <div>Error: {userError}</div>
  }

  if (!currentUser) {
    return <div>User not found</div>
  }

  return (
    <div className="user-profile">
      <img src={currentUser.avatar} alt={currentUser.name} />
      <h1>{currentUser.name}</h1>
      <p>{currentUser.email}</p>
      <p>{currentUser.bio}</p>
      <small>Member since: {currentUser.createdAt.toLocaleDateString()}</small>
    </div>
  )
}
```

### Example 3: User Search with Filters

Advanced usage with filtering:

```typescript
import { useUsers } from '@/modules/ui/user-profile-ui'
import { useState, useEffect } from 'react'

export function UserSearch() {
  const { users, isLoadingUsers, fetchUsers, filter, setFilter, total } =
    useUsers()
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilter({ search: searchTerm, offset: 0 })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchUsers(filter)
  }, [filter])

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search users..."
      />

      <select
        value={filter.sortBy || 'createdAt'}
        onChange={(e) =>
          setFilter({
            sortBy: e.target.value as 'name' | 'email' | 'createdAt',
          })
        }
      >
        <option value="name">Sort by Name</option>
        <option value="email">Sort by Email</option>
        <option value="createdAt">Sort by Date</option>
      </select>

      {isLoadingUsers ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>
            Showing {users.length} of {total} users
          </p>
          <ul>
            {users.map((user) => (
              <li key={user.id}>
                {user.name} - {user.email}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
```

## Testing

### Running Tests

```bash
# Run all tests for this module
npm test -- modules/ui/user-profile-ui

# Watch mode
npm test -- --watch modules/ui/user-profile-ui

# Coverage report
npm test -- --coverage modules/ui/user-profile-ui

# Type check
npm run type-check
```

### Testing Components that Use This Module

#### Testing UserList Component

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UserList } from '@/modules/ui/user-profile-ui'

// Mock the hooks
jest.mock('@/modules/ui/user-profile-ui', () => ({
  ...jest.requireActual('@/modules/ui/user-profile-ui'),
  useUsers: jest.fn(),
}))

describe('UserList', () => {
  const mockUseUsers = useUsers as jest.Mock

  beforeEach(() => {
    mockUseUsers.mockReturnValue({
      users: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      isLoadingUsers: false,
      usersError: null,
      deleteUser: jest.fn(),
      fetchUsers: jest.fn(),
    })
  })

  it('should render user list', () => {
    render(<UserList />)
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
  })

  it('should call deleteUser when delete button clicked', async () => {
    const deleteUser = jest.fn()
    mockUseUsers.mockReturnValue({
      users: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      deleteUser,
      isLoadingUsers: false,
      fetchUsers: jest.fn(),
    })

    render(<UserList />)

    const deleteButton = screen.getByRole('button', { name: /delete/i })
    fireEvent.click(deleteButton)

    await waitFor(() => {
      expect(deleteUser).toHaveBeenCalledWith('1')
    })
  })
})
```

#### Testing useUsers Hook

```typescript
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUsers } from "@/modules/ui/user-profile-ui";

describe("useUsers", () => {
  it("should fetch users on mount", async () => {
    const { result } = renderHook(() => useUsers());

    act(() => {
      result.current.fetchUsers();
    });

    await waitFor(() => {
      expect(result.current.isLoadingUsers).toBe(false);
    });

    expect(result.current.users).toBeDefined();
  });

  it("should create user successfully", async () => {
    const { result } = renderHook(() => useUsers());

    const newUser = {
      email: "test@example.com",
      name: "Test User",
    };

    await act(async () => {
      await result.current.createUser(newUser);
    });

    expect(result.current.users).toContainEqual(
      expect.objectContaining({ email: "test@example.com" }),
    );
  });

  it("should handle errors", async () => {
    const { result } = renderHook(() => useUsers());

    // Force an error by passing invalid data
    await act(async () => {
      try {
        await result.current.createUser({ email: "", name: "" });
      } catch (error) {
        // Expected
      }
    });

    expect(result.current.usersError).toBeTruthy();
  });
});
```

#### Testing useUser Hook

```typescript
import { renderHook, act, waitFor } from "@testing-library/react";
import { useUser } from "@/modules/ui/user-profile-ui";

describe("useUser", () => {
  it("should initialize with null user", () => {
    const { result } = renderHook(() => useUser());

    expect(result.current.currentUser).toBeNull();
    expect(result.current.isLoadingUser).toBe(false);
    expect(result.current.userError).toBeNull();
  });

  it("should fetch user by id", async () => {
    const { result } = renderHook(() => useUser());

    await act(async () => {
      await result.current.fetchUser("user-123");
    });

    await waitFor(() => {
      expect(result.current.isLoadingUser).toBe(false);
    });

    expect(result.current.currentUser).toBeDefined();
    expect(result.current.currentUser?.id).toBe("user-123");
  });

  it("should clear user", () => {
    const { result } = renderHook(() => useUser());

    act(() => {
      result.current.clearUser();
    });

    expect(result.current.currentUser).toBeNull();
  });
});
```

#### Testing with Zustand Store

```typescript
import { renderHook, act } from "@testing-library/react";
import { useUserStore } from "@/modules/ui/user-profile-ui";

describe("useUserStore", () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useUserStore());
    act(() => {
      result.current.reset();
    });
  });

  it("should have correct initial state", () => {
    const { result } = renderHook(() => useUserStore());

    expect(result.current.users).toEqual([]);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isLoadingUsers).toBe(false);
    expect(result.current.total).toBe(0);
  });

  it("should add user to store", () => {
    const { result } = renderHook(() => useUserStore());

    const newUser = {
      id: "1",
      email: "test@example.com",
      name: "Test User",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    act(() => {
      result.current.addUser(newUser);
    });

    expect(result.current.users).toHaveLength(1);
    expect(result.current.users[0]).toEqual(newUser);
  });

  it("should update user in store", () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.addUser({
        id: "1",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    act(() => {
      result.current.updateUser("1", { name: "Updated Name" });
    });

    expect(result.current.users[0].name).toBe("Updated Name");
  });

  it("should remove user from store", () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.addUser({
        id: "1",
        email: "test@example.com",
        name: "Test User",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    act(() => {
      result.current.removeUser("1");
    });

    expect(result.current.users).toHaveLength(0);
  });
});
```

### Mocking This Module

If you need to mock this module in other tests:

```typescript
// __mocks__/@/modules/ui/user-profile-ui.tsx
export const UserList = () => <div>Mocked UserList</div>

export const useUsers = jest.fn(() => ({
  users: [],
  isLoadingUsers: false,
  usersError: null,
  fetchUsers: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  loadMore: jest.fn(),
  setFilter: jest.fn(),
  filter: {},
  hasMore: false,
  total: 0,
}))

export const useUser = jest.fn(() => ({
  currentUser: null,
  isLoadingUser: false,
  userError: null,
  fetchUser: jest.fn(),
  clearUser: jest.fn(),
}))
```

## Integration Notes

This module expects the `user-logic` module to be integrated for actual backend operations. Currently uses mock implementations with TODOs marked.

**To integrate with user-logic module:**

1. Install user-logic module
2. Import userService from '@/modules/logic/user-logic'
3. Replace mock implementations in hooks with actual service calls

## Contributing

When contributing to this module:

1. Maintain Single Responsibility Principle
2. Update module.json when adding new exports
3. Add tests for new components/hooks
4. Update this documentation
5. Run `npm run modules:sync` after changes

## License

MIT

---

**Module Version**: 1.0.0
**Last Updated**: 2025-01-11
**Status**: Stable
