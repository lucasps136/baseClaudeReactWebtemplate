// App constants
export const APP_NAME = "Next.js SOLID Boilerplate";

// Routes
export const ROUTES = {
  HOME: "/",
  HOME_PROTECTED: "/home",
  AUTH: {
    LOGIN: "/auth/login",
    REGISTER: "/auth/register",
  },
} as const;

// Environment helpers
export const IS_DEV = process.env.NODE_ENV === "development";
export const IS_PROD = process.env.NODE_ENV === "production";
