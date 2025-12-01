import { useCallback } from "react";

import { useUserStore } from "../stores/user.store";
import type {
  IUserListFilter,
  ICreateUserInput,
  IUpdateUserInput,
  IUserProfile,
} from "../types/user.types";

interface IUseUsersReturn {
  users: IUserProfile[];
  isLoadingUsers: boolean;
  usersError: string | null;
  filter: IUserListFilter;
  hasMore: boolean;
  total: number;
  fetchUsers: (newFilter?: Partial<IUserListFilter>) => Promise<void>;
  createUser: (input: ICreateUserInput) => Promise<IUserProfile>;
  updateUser: (
    id: string,
    input: IUpdateUserInput,
  ) => Promise<Partial<IUserProfile> & { updatedAt: Date }>;
  deleteUser: (id: string) => Promise<void>;
  loadMore: () => Promise<void>;
  setFilter: (filter: Partial<IUserListFilter>) => void;
}

// Custom hook following Single Responsibility
// Only handles user list operations
export const useUsers = (): IUseUsersReturn => {
  const {
    users,
    isLoadingUsers,
    usersError,
    filter,
    hasMore,
    total,
    setUsers,
    addUser,
    updateUser: updateUserInStore,
    removeUser,
    setUsersLoading,
    setUsersError,
    setFilter,
    setHasMore,
    setTotal,
  } = useUserStore();

  const fetchUsers = useCallback(
    async (newFilter?: Partial<IUserListFilter>): Promise<void> => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        if (newFilter) {
          setFilter(newFilter);
        }

        // TODO: Replace with actual service call when implemented
        // const userService = getUserService()
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
    [setUsers, setUsersLoading, setUsersError, setFilter, setTotal, setHasMore],
  );

  const createUser = useCallback(
    async (input: ICreateUserInput): Promise<IUserProfile> => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        // TODO: Replace with actual service call
        // const userService = getUserService()
        // const newUser = await userService.createUser(input)

        // Mock implementation
        const newUser: IUserProfile = {
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
    async (
      id: string,
      input: IUpdateUserInput,
    ): Promise<Partial<IUserProfile> & { updatedAt: Date }> => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        // TODO: Replace with actual service call
        // const userService = getUserService()
        // const updatedUser = await userService.updateUser(id, input)

        // Mock implementation
        const updates = { ...input, updatedAt: new Date() };

        updateUserInStore(id, updates);
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
    [updateUserInStore, setUsersLoading, setUsersError],
  );

  const deleteUser = useCallback(
    async (id: string): Promise<void> => {
      try {
        setUsersLoading(true);
        setUsersError(null);

        // TODO: Replace with actual service call
        // const userService = getUserService()
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

  const loadMore = useCallback(async (): Promise<void> => {
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
