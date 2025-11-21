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
    (set, get) => ({
      ...initialState,

      // Single user actions
      setCurrentUser: (currentUser) =>
        set({ currentUser, userError: null }, false, "user/setCurrentUser"),

      setUserLoading: (isLoadingUser) =>
        set({ isLoadingUser }, false, "user/setUserLoading"),

      setUserError: (userError) =>
        set({ userError }, false, "user/setUserError"),

      // List actions
      setUsers: (users) =>
        set({ users, usersError: null }, false, "user/setUsers"),

      addUser: (user) =>
        set(
          (state) => ({ users: [...state.users, user] }),
          false,
          "user/addUser",
        ),

      updateUser: (id, updates) =>
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

      removeUser: (id) =>
        set(
          (state) => ({
            users: state.users.filter((user) => user.id !== id),
            currentUser:
              state.currentUser?.id === id ? null : state.currentUser,
          }),
          false,
          "user/removeUser",
        ),

      setUsersLoading: (isLoadingUsers) =>
        set({ isLoadingUsers }, false, "user/setUsersLoading"),

      setUsersError: (usersError) =>
        set({ usersError }, false, "user/setUsersError"),

      setFilter: (filterUpdates) =>
        set(
          (state) => ({ filter: { ...state.filter, ...filterUpdates } }),
          false,
          "user/setFilter",
        ),

      setHasMore: (hasMore) => set({ hasMore }, false, "user/setHasMore"),

      setTotal: (total) => set({ total }, false, "user/setTotal"),

      reset: () => set(initialState, false, "user/reset"),
    }),
    {
      name: "user-store",
    },
  ),
);
