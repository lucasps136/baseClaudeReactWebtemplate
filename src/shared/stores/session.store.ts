import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

interface ISessionState {
  sessionId: string | null;
  lastActivity: Date | null;
  expiresAt: Date | null;
  isActive: boolean;
}

interface ISessionActions {
  createSession: (sessionId: string, expiresAt: Date) => void;
  refreshSession: (expiresAt: Date) => void;
  updateActivity: () => void;
  destroySession: () => void;
  isSessionValid: () => boolean;
}

export type SessionStore = ISessionState & ISessionActions;

export const useSessionStore = create<SessionStore>()(
  devtools(
    persist(
      (set, get) => ({
        // State
        sessionId: null,
        lastActivity: null,
        expiresAt: null,
        isActive: false,

        // Actions
        createSession: (sessionId, expiresAt): void => {
          set({ sessionId, expiresAt, lastActivity: new Date(), isActive: true }, false, "session/create");
        },
        refreshSession: (expiresAt): void => {
          set({ expiresAt, lastActivity: new Date() }, false, "session/refresh");
        },
        updateActivity: (): void => {
          set({ lastActivity: new Date() }, false, "session/updateActivity");
        },
        destroySession: (): void => {
          set({ sessionId: null, lastActivity: null, expiresAt: null, isActive: false }, false, "session/destroy");
        },

        isSessionValid: (): boolean => {
          const state = get();
          if (!state.sessionId || !state.expiresAt) return false;
          return new Date() < state.expiresAt;
        },
      }),
      {
        name: "session-store",
        partialize: (state) => ({
          sessionId: state.sessionId,
          expiresAt: state.expiresAt,
          lastActivity: state.lastActivity,
        }),
      },
    ),
    {
      name: "session-store",
    },
  ),
);
