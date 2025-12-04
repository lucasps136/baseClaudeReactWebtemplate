import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { IUserProfile, IUserListFilter } from "../types/user.types";

interface IUserState {
  // Single user state
  currentUser: IUserProfile | null;
  isLoadingUser: boolean;
  userError: string | null;

  // List state
  users: IUserProfile[];
  isLoadingUsers: boolean;
  usersError: string | null;
  filter: IUserListFilter;
  hasMore: boolean;
  total: number;
}

interface IUserActions {
  // Single user actions
  setCurrentUser: (user: IUserProfile | null) => void;
  setUserLoading: (loading: boolean) => void;
  setUserError: (error: string | null) => void;

  // List actions
  setUsers: (users: IUserProfile[]) => void;
  addUser: (user: IUserProfile) => void;
  updateUser: (id: string, updates: Partial<IUserProfile>) => void;
  removeUser: (id: string) => void;
  setUsersLoading: (loading: boolean) => void;
  setUsersError: (error: string | null) => void;
  setFilter: (filter: Partial<IUserListFilter>) => void;
  setHasMore: (hasMore: boolean) => void;
  setTotal: (total: number) => void;

  // Utility actions
  reset: () => void;
}

export type UserStore = IUserState & IUserActions;

const initialState: IUserState = {
  currentUser: null,
  isLoadingUser: false,
  userError: null,
  users: [],
  isLoadingUsers: false,
  usersError: null,
  filter: {
    limit: 20,
    offset: 0,
    sortBy: "createdAt",
    sortOrder: "desc",
  },
  hasMore: false,
  total: 0,
};

export const useUserStore = create<UserStore>()(
  devtools(
    (set) => ({
      ...initialState,
      // Single user actions
      setCurrentUser: (currentUser: IUserProfile | null): void =>
        set({ currentUser, userError: null }, false, "user/setCurrentUser"),
      setUserLoading: (isLoadingUser: boolean): void =>
        set({ isLoadingUser }, false, "user/setUserLoading"),
      setUserError: (userError: string | null): void =>
        set({ userError }, false, "user/setUserError"),
      // List actions
      setUsers: (users: IUserProfile[]): void =>
        set({ users, usersError: null }, false, "user/setUsers"),
      addUser: (user: IUserProfile): void =>
        set(
          (state) => ({ users: [...state.users, user] }),
          false,
          "user/addUser",
        ),
      updateUser: (id: string, updates: Partial<IUserProfile>): void =>
        set(
          (state) => ({
            users: state.users.map((user) =>
              user.id === id ? { ...user, ...updates } : user,
            ),
            currentUser:
              state.currentUser?.id === id
                ? { ...state.currentUser, ...updates }
                : state.currentUser,
          }),
          false,
          "user/updateUser",
        ),
      removeUser: (id: string): void =>
        set(
          (state) => ({
            users: state.users.filter((user) => user.id !== id),
            currentUser:
              state.currentUser?.id === id ? null : state.currentUser,
          }),
          false,
          "user/removeUser",
        ),
      setUsersLoading: (isLoadingUsers: boolean): void =>
        set({ isLoadingUsers }, false, "user/setUsersLoading"),
      setUsersError: (usersError: string | null): void =>
        set({ usersError }, false, "user/setUsersError"),
      setFilter: (filterUpdates: Partial<IUserListFilter>): void =>
        set(
          (state) => ({ filter: { ...state.filter, ...filterUpdates } }),
          false,
          "user/setFilter",
        ),
      setHasMore: (hasMore: boolean): void =>
        set({ hasMore }, false, "user/setHasMore"),
      setTotal: (total: number): void => set({ total }, false, "user/setTotal"),
      reset: (): void => set(initialState, false, "user/reset"),
    }),
    {
      name: "user-store",
    },
  ),
);
