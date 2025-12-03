import { useCallback } from "react";

import { useUserStore } from "../stores/user.store";
import type { IUserProfile } from "../types/user.types";

interface IUseUserReturn {
  currentUser: IUserProfile | null;
  isLoadingUser: boolean;
  userError: string | null;
  fetchUser: (id: string) => Promise<IUserProfile | null>;
  clearUser: () => void;
}

// Validation (SRP: Input validation)
const validateUserId = (id: string): string | null => {
  if (!id) return "User ID is required";
  return null;
};

// Error Handling (SRP: Error message conversion)
const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : "Failed to fetch user";
};

// Service Call (SRP: API communication)
const fetchUserFromService = async (
  id: string, // eslint-disable-line @typescript-eslint/no-unused-vars
): Promise<IUserProfile | null> => {
  // TODO: Replace with actual service call when implemented
  // const userService = getUserService()
  // return await userService.getUserById(id)

  // Mock implementation for now
  return null;
};

// Custom hook following Single Responsibility
// Only handles single user operations
export const useUser = (): IUseUserReturn => {
  const {
    currentUser,
    isLoadingUser,
    userError,
    setCurrentUser,
    setUserLoading,
    setUserError,
  } = useUserStore();

  const fetchUser = useCallback(
    async (id: string): Promise<IUserProfile | null> => {
      const validationError = validateUserId(id);
      if (validationError) {
        setUserError(validationError);
        return null;
      }

      try {
        setUserLoading(true);
        setUserError(null);

        const user = await fetchUserFromService(id);

        setCurrentUser(user);
        return user;
      } catch (error) {
        setUserError(getErrorMessage(error));
        return null;
      } finally {
        setUserLoading(false);
      }
    },
    [setCurrentUser, setUserLoading, setUserError],
  );

  const clearUser = useCallback((): void => {
    setCurrentUser(null);
    setUserError(null);
  }, [setCurrentUser, setUserError]);

  return {
    // State
    currentUser,
    isLoadingUser,
    userError,

    // Actions
    fetchUser,
    clearUser,
  };
};
