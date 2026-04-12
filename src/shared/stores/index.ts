// Export all stores for easy importing
export { useSessionStore, type SessionStore } from "./session.store";
export { useUIStore, type UIStore } from "./ui.store";

// Import stores for internal use
import { useSessionStore } from "./session.store";

// Store utilities
export const resetAllStores = (): void => {
  // This function can be used to reset all stores
  // Useful for logout or testing scenarios
  useSessionStore.getState().destroySession();
  // UI store typically doesn't need reset, but can be extended
};
