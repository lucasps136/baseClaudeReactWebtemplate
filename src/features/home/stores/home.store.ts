import { create } from "zustand";
import { devtools } from "zustand/middleware";

import type { IHomeActions, IHomeData, IHomeState } from "../types/home.types";

export type HomeStore = IHomeState & IHomeActions;

const initialState: IHomeState = {
  data: null,
  isLoading: false,
  error: null,
};

export const useHomeStore = create<HomeStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setData: (data: IHomeData): void =>
        set({ data, error: null }, false, "home/setData"),

      setLoading: (isLoading: boolean): void =>
        set({ isLoading }, false, "home/setLoading"),

      setError: (error: string | null): void =>
        set({ error }, false, "home/setError"),

      reset: (): void => set(initialState, false, "home/reset"),
    }),
    { name: "home-store" },
  ),
);
