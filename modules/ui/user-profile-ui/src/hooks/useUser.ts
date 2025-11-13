import { useCallback } from "react";
import { useUserStore } from "../stores/user.store";

// Custom hook following Single Responsibility
// Only handles single user operations
export const useUser = () => {
  const {
    currentUser,
    isLoadingUser,
    userError,
    setCurrentUser,
    setUserLoading,
    setUserError,
  } = useUserStore();

  const fetchUser = useCallback(
    async (id: string) => {
      if (!id) {
        setUserError("User ID is required");
        return null;
      }

      try {
        setUserLoading(true);
        setUserError(null);

        // TODO: Replace with actual service call when user-logic module is integrated
        // import { userService } from '@/modules/logic/user-logic'
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

  const clearUser = useCallback(() => {
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
