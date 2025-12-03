import { useCallback } from "react";

import { useUserStore, type UserStore } from "../stores/user.store";
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

// Service Layer (SRP: Handle API communication)
/**
 * Fetches users from the service
 */
const fetchUsersFromService = async (
  filter: IUserListFilter, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<{
  users: IUserProfile[];
  total: number;
  hasMore: boolean;
}> => {
  // TODO: Replace with actual service call when implemented
  // const userService = getUserService()
  // return await userService.getUsers(filter)

  // Mock implementation for now
  return {
    users: [],
    total: 0,
    hasMore: false,
  };
};

/**
 * Creates a new user via service
 */
const createUserInService = async (
  input: ICreateUserInput,
): Promise<IUserProfile> => {
  // TODO: Replace with actual service call
  // const userService = getUserService()
  // return await userService.createUser(input)

  // Mock implementation
  return {
    id: crypto.randomUUID(),
    ...input,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Updates user in service
 */
const updateUserInService = async (
  id: string,
  input: IUpdateUserInput,
): Promise<Partial<IUserProfile> & { updatedAt: Date }> => {
  // TODO: Replace with actual service call
  // const userService = getUserService()
  // return await userService.updateUser(id, input)

  // Mock implementation
  return { ...input, updatedAt: new Date() };
};

/**
 * Deletes user from service
 */
const deleteUserFromService = async (
  id: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<void> => {
  // TODO: Replace with actual service call
  // const userService = getUserService()
  // await userService.deleteUser(id)

  // Mock implementation - no-op for now
  return Promise.resolve();
};

// Error Handling (SRP: Convert errors to user-friendly messages)
/**
 * Converts error to user-friendly message
 */
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  return error instanceof Error ? error.message : defaultMessage;
};

// Helper: Fetch users operation
const useFetchUsers = (
  filter: IUserListFilter,
  setters: UserStore,
): ((newFilter?: Partial<IUserListFilter>) => Promise<void>) => {
  return useCallback(
    async (newFilter?: Partial<IUserListFilter>): Promise<void> => {
      try {
        setters.setUsersLoading(true);
        setters.setUsersError(null);

        const mergedFilter = { ...filter, ...newFilter };
        if (newFilter) {
          setters.setFilter(newFilter);
        }

        const result = await fetchUsersFromService(mergedFilter);
        setters.setUsers(result.users);
        setters.setTotal(result.total);
        setters.setHasMore(result.hasMore);
      } catch (error) {
        setters.setUsersError(getErrorMessage(error, "Failed to fetch users"));
      } finally {
        setters.setUsersLoading(false);
      }
    },
    [filter, setters],
  );
};

// Helper: Create user operation
const useCreateUser = (
  setters: UserStore,
): ((input: ICreateUserInput) => Promise<IUserProfile>) => {
  return useCallback(
    async (input: ICreateUserInput): Promise<IUserProfile> => {
      try {
        setters.setUsersLoading(true);
        setters.setUsersError(null);
        const newUser = await createUserInService(input);
        setters.addUser(newUser);
        return newUser;
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Failed to create user");
        setters.setUsersError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setters.setUsersLoading(false);
      }
    },
    [setters],
  );
};

/**
 * Custom hook following Single Responsibility
 * Only handles user list operations
 */
export const useUsers = (): IUseUsersReturn => {
  const storeState = useUserStore();
  const {
    users,
    isLoadingUsers,
    usersError,
    filter,
    hasMore,
    total,
    updateUser: updateUserInStore,
    removeUser,
    setUsersLoading,
    setUsersError,
    setFilter,
  } = storeState;

  const fetchUsers = useFetchUsers(filter, storeState);
  const createUser = useCreateUser(storeState);

  const updateUserById = useCallback(
    async (
      id: string,
      input: IUpdateUserInput,
    ): Promise<Partial<IUserProfile> & { updatedAt: Date }> => {
      try {
        setUsersLoading(true);
        setUsersError(null);
        const updates = await updateUserInService(id, input);
        updateUserInStore(id, updates);
        return updates;
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Failed to update user");
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
        await deleteUserFromService(id);
        removeUser(id);
      } catch (error) {
        const errorMessage = getErrorMessage(error, "Failed to delete user");
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
    users,
    isLoadingUsers,
    usersError,
    filter,
    hasMore,
    total,
    fetchUsers,
    createUser,
    updateUser: updateUserById,
    deleteUser,
    loadMore,
    setFilter,
  };
};
