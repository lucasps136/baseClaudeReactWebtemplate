import { useCallback } from "react";
import { useUserStore } from "../stores/user.store";
import type {
  UserListFilter,
  CreateUserInput,
  UpdateUserInput,
} from "../types";

// Custom hook following Single Responsibility
// Only handles user list operations
export const useUsers = () => {
  const {
    users,
    isLoadingUsers,
    usersError,
    filter,
    hasMore,
    total,
    setUsers,
    addUser,
    updateUser,
    removeUser,
    setUsersLoading,
    setUsersError,
    setFilter,
    setHasMore,
    setTotal,
  } = useUserStore();

  const fetchUsers = useCallback(
    async (newFilter?: Partial<UserListFilter>) => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        if (newFilter) {
          setFilter(newFilter);
        }

        // TODO: Replace with actual service call when user-logic module is integrated
        // import { userService } from '@/modules/logic/user-logic'
        // const result = await userService.getUsers({ ...filter, ...newFilter })

        // Mock implementation for now
        const result = {
          users: [],
          total: 0,
          hasMore: false,
        };

        setUsers(result.users);
        setTotal(result.total);
        setHasMore(result.hasMore);
      } catch (error) {
        setUsersError(
          error instanceof Error ? error.message : "Failed to fetch users",
        );
      } finally {
        setUsersLoading(false);
      }
    },
    [
      filter,
      setUsers,
      setUsersLoading,
      setUsersError,
      setFilter,
      setTotal,
      setHasMore,
    ],
  );

  const createUser = useCallback(
    async (input: CreateUserInput) => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        // TODO: Replace with actual service call when user-logic module is integrated
        // import { userService } from '@/modules/logic/user-logic'
        // const newUser = await userService.createUser(input)

        // Mock implementation
        const newUser = {
          id: crypto.randomUUID(),
          ...input,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addUser(newUser);
        return newUser;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to create user";
        setUsersError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setUsersLoading(false);
      }
    },
    [addUser, setUsersLoading, setUsersError],
  );

  const updateUserById = useCallback(
    async (id: string, input: UpdateUserInput) => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        // TODO: Replace with actual service call when user-logic module is integrated
        // import { userService } from '@/modules/logic/user-logic'
        // const updatedUser = await userService.updateUser(id, input)

        // Mock implementation
        const updates = { ...input, updatedAt: new Date() };

        updateUser(id, updates);
        return updates;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update user";
        setUsersError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setUsersLoading(false);
      }
    },
    [updateUser, setUsersLoading, setUsersError],
  );

  const deleteUser = useCallback(
    async (id: string) => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        // TODO: Replace with actual service call when user-logic module is integrated
        // import { userService } from '@/modules/logic/user-logic'
        // await userService.deleteUser(id)

        removeUser(id);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to delete user";
        setUsersError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setUsersLoading(false);
      }
    },
    [removeUser, setUsersLoading, setUsersError],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingUsers) return;

    const nextOffset = users.length;
    await fetchUsers({ ...filter, offset: nextOffset });
  }, [hasMore, isLoadingUsers, users.length, filter, fetchUsers]);

  return {
    // State
    users,
    isLoadingUsers,
    usersError,
    filter,
    hasMore,
    total,

    // Actions
    fetchUsers,
    createUser,
    updateUser: updateUserById,
    deleteUser,
    loadMore,
    setFilter,
  };
};
