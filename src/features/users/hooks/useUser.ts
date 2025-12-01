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
      if (!id) {
        setUserError("User ID is required");
        return null;
      }

      try {
        setUserLoading(true);
        setUserError(null);

        // TODO: Replace with actual service call when implemented
        // const userService = getUserService()
        // const user = await userService.getUserById(id)

        // Mock implementation for now
        const user = null; // await userService.getUserById(id)

        setCurrentUser(user);
        return user;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch user";
        setUserError(errorMessage);
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
