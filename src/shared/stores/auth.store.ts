import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface IUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface IAuthActions {
  setUser: (user: IUser) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export type AuthStore = IAuthState & IAuthActions;

export const useAuthStore = create<AuthStore>()(
  devtools(
    (set) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user): void =>
        set(
          { user, isAuthenticated: true, error: null },
          false,
          "auth/setUser",
        ),

      clearUser: (): void =>
        set(
          { user: null, isAuthenticated: false, error: null },
          false,
          "auth/clearUser",
        ),

      setLoading: (isLoading): void =>
        set({ isLoading }, false, "auth/setLoading"),

      setError: (error): void => set({ error }, false, "auth/setError"),
    }),
    {
      name: "auth-store",
    },
  ),
);
