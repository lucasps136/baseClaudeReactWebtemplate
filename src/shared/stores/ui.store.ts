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
    data: any;
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
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
}

export type UIStore = IUIState & IUIActions;

export const useUIStore = create<UIStore>()(
  devtools(
    (set, get) => ({
      // State
      theme: "system",
      sidebarOpen: false,
      loading: false,
      notifications: [],
      modal: {
        isOpen: false,
        type: null,
        data: null,
      },

      // Actions
      setTheme: (theme) => set({ theme }, false, "ui/setTheme"),

      toggleSidebar: () =>
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          "ui/toggleSidebar",
        ),

      setSidebarOpen: (sidebarOpen) =>
        set({ sidebarOpen }, false, "ui/setSidebarOpen"),

      setLoading: (loading) => set({ loading }, false, "ui/setLoading"),

      addNotification: (notification) => {
        const id = crypto.randomUUID();
        const newNotification: INotification = {
          ...notification,
          id,
          timestamp: new Date(),
        };

        set(
          (state) => ({
            notifications: [...state.notifications, newNotification],
          }),
          false,
          "ui/addNotification",
        );

        // Auto-remove after 5 seconds if autoClose is true (default)
        if (notification.autoClose !== false) {
          setTimeout(() => {
            const { removeNotification } = get();
            removeNotification(id);
          }, 5000);
        }
      },

      removeNotification: (id) =>
        set(
          (state) => ({
            notifications: state.notifications.filter((n) => n.id !== id),
          }),
          false,
          "ui/removeNotification",
        ),

      clearNotifications: () =>
        set({ notifications: [] }, false, "ui/clearNotifications"),

      openModal: (type, data = null) =>
        set(
          {
            modal: {
              isOpen: true,
              type,
              data,
            },
          },
          false,
          "ui/openModal",
        ),

      closeModal: () =>
        set(
          {
            modal: {
              isOpen: false,
              type: null,
              data: null,
            },
          },
          false,
          "ui/closeModal",
        ),
    }),
    {
      name: "ui-store",
    },
  ),
);
