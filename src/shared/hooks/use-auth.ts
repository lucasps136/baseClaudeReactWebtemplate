/**
 * Authentication Hook
 * Provides access to authentication state and methods
 */

import { useAuthStore } from "@/shared/stores/auth.store";
import type { IAuthState } from "@/shared/types/auth";

interface IUseAuthReturn {
  user: IAuthState["user"];
  isLoading: boolean;
  isAuthenticated: boolean;
  error: IAuthState["error"];
}

export function useAuth(): IUseAuthReturn {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const error = useAuthStore((state) => state.error);

  return {
    user,
    isLoading,
    isAuthenticated,
    error,
  };
}
