// State Manager
// Single Responsibility: Manage authentication state and notify listeners

import type { IAuthState } from "@/shared/types/auth";

export class StateManager {
  private state: IAuthState = {
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  };
  private listeners: ((state: IAuthState) => void)[] = [];

  getState(): IAuthState {
    return { ...this.state };
  }

  setState(partial: Partial<IAuthState>): void {
    this.state = { ...this.state, ...partial };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.getState()));
  }

  addListener(callback: (state: IAuthState) => void): () => void {
    this.listeners.push(callback);

    // Return function to remove listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  clearListeners(): void {
    this.listeners = [];
  }
}
