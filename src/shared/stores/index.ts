// Export all stores for easy importing
export { useAuthStore, type AuthStore, type IUser } from "./auth.store";
export { useSessionStore, type SessionStore } from "./session.store";
export { useUIStore, type UIStore } from "./ui.store";

// Import stores for internal use
import { useAuthStore } from "./auth.store";
import { useSessionStore } from "./session.store";

// Store utilities
export const resetAllStores = () => {
  // This function can be used to reset all stores
  // Useful for logout or testing scenarios
  useAuthStore.getState().clearUser();
  useSessionStore.getState().destroySession();
  // UI store typically doesn't need reset, but can be extended
};
