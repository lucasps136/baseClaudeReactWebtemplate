import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface IUIState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  loading: boolean;
  notifications: INotification[];
  modal: {
    isOpen: boolean;
    type: string | null;
    data: Record<string, unknown> | null;
  };
}

interface INotification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  timestamp: Date;
  autoClose?: boolean;
}

interface IUIActions {
  setTheme: (theme: IUIState["theme"]) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (
    notification: Omit<INotification, "id" | "timestamp">,
  ) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  openModal: (type: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;
}

export type UIStore = IUIState & IUIActions;

// SRP: Create notification with ID and timestamp
const createNotification = (
  notification: Omit<INotification, "id" | "timestamp">,
): INotification => {
  return {
    ...notification,
    id: crypto.randomUUID(),
    timestamp: new Date(),
  };
};

// SRP: Schedule auto-removal of notification
const scheduleNotificationRemoval = (
  id: string,
  removeNotification: (id: string) => void,
  delay: number = 5000,
): void => {
  setTimeout(() => {
    removeNotification(id);
  }, delay);
};

// Initial state factory
const createInitialState = (): IUIState => ({
  theme: "system" as const,
  sidebarOpen: false,
  loading: false,
  notifications: [],
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
});

// Actions factory
const createUIActions = (
  set: Parameters<Parameters<typeof create<UIStore>>[0]>[0],
  get: Parameters<Parameters<typeof create<UIStore>>[0]>[1],
): IUIActions => ({
  setTheme: (theme: ITheme): void => set({ theme }, false, "ui/setTheme"),
  toggleSidebar: (): void =>
    set(
      (state) => ({ sidebarOpen: !state.sidebarOpen }),
      false,
      "ui/toggleSidebar",
    ),
  setSidebarOpen: (sidebarOpen: boolean): void =>
    set({ sidebarOpen }, false, "ui/setSidebarOpen"),
  setLoading: (loading: boolean): void =>
    set({ loading }, false, "ui/setLoading"),
  addNotification: (notification: INotificationInput): void => {
    const newNotification = createNotification(notification);
    set(
      (state) => ({ notifications: [...state.notifications, newNotification] }),
      false,
      "ui/addNotification",
    );
    if (notification.autoClose !== false) {
      const { removeNotification } = get();
      scheduleNotificationRemoval(newNotification.id, removeNotification);
    }
  },
  removeNotification: (id: string): void =>
    set(
      (state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }),
      false,
      "ui/removeNotification",
    ),
  clearNotifications: (): void =>
    set({ notifications: [] }, false, "ui/clearNotifications"),
  openModal: (type: IModalType, data: unknown = null): void =>
    set({ modal: { isOpen: true, type, data } }, false, "ui/openModal"),
  closeModal: (): void =>
    set(
      { modal: { isOpen: false, type: null, data: null } },
      false,
      "ui/closeModal",
    ),
});

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      ...createInitialState(),
      ...createUIActions(set, get),
    }),
    { name: "ui-store" },
  ),
);
