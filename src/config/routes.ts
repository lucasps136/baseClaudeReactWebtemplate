/**
 * Route configuration for the application
 * This centralizes all route definitions and makes it easy to manage routing logic
 *
 * TEMPLATE NOTE: Modify these routes according to your application's needs
 */

export const routes = {
  // Public routes (no authentication required)
  public: {
    home: "/",
    about: "/about",
    contact: "/contact",
    pricing: "/pricing",
    blog: "/blog",
    docs: "/docs",
  },

  // Authentication routes
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    verifyEmail: "/auth/verify-email",
    callback: "/auth/callback", // OAuth callback
  },

  // Protected routes (authentication required)
  protected: {
    dashboard: "/dashboard",
    profile: "/profile",
    settings: "/settings",
    billing: "/billing",

    // Admin routes
    admin: {
      dashboard: "/admin",
      users: "/admin/users",
      settings: "/admin/settings",
      analytics: "/admin/analytics",
    },
  },

  // API routes
  api: {
    auth: "/api/auth",
    users: "/api/users",
    posts: "/api/posts",

    // Public API routes (no auth required)
    public: {
      health: "/api/health",
      contact: "/api/contact",
    },

    // Webhooks
    webhooks: {
      stripe: "/api/webhooks/stripe",
      github: "/api/webhooks/github",
    },
  },

  // Legal pages
  legal: {
    privacy: "/privacy",
    terms: "/terms",
    cookies: "/cookies",
  },

  // Error pages
  errors: {
    notFound: "/404",
    serverError: "/500",
    unauthorized: "/401",
    forbidden: "/403",
  },
} as const;

/**
 * Route groups for middleware and route protection
 */
export const routeGroups = {
  // Routes that require authentication
  protected: [
    routes.protected.dashboard,
    routes.protected.profile,
    routes.protected.settings,
    routes.protected.billing,
    ...Object.values(routes.protected.admin),
  ],

  // Routes that redirect authenticated users
  authOnly: Object.values(routes.auth),

  // Admin-only routes
  adminOnly: Object.values(routes.protected.admin),

  // Public API routes (no rate limiting)
  publicApi: Object.values(routes.api.public),

  // API routes that need authentication
  protectedApi: [routes.api.users, routes.api.posts],
} as const;

/**
 * Helper functions for route checking
 */
export const isProtectedRoute = (pathname: string): boolean => {
  return routeGroups.protected.some((route) => pathname.startsWith(route));
};

export const isAuthRoute = (pathname: string): boolean => {
  return (routeGroups.authOnly as readonly string[]).includes(pathname);
};

export const isAdminRoute = (pathname: string): boolean => {
  return routeGroups.adminOnly.some((route) => pathname.startsWith(route));
};

export const isPublicApiRoute = (pathname: string): boolean => {
  return routeGroups.publicApi.some((route) => pathname.startsWith(route));
};

export const isProtectedApiRoute = (pathname: string): boolean => {
  return routeGroups.protectedApi.some((route) => pathname.startsWith(route));
};

/**
 * Default redirects after certain actions
 */
export const redirects = {
  afterLogin: routes.protected.dashboard,
  afterLogout: routes.public.home,
  afterRegister: routes.protected.dashboard,
  unauthorized: routes.auth.login,
  adminRequired: routes.errors.forbidden,
} as const;

/**
 * TEMPLATE EXAMPLE: Custom route builder for dynamic routes
 * Remove or modify based on your needs
 */
export const buildRoute = {
  userProfile: (userId: string) => `/users/${userId}`,
  blogPost: (slug: string) => `/blog/${slug}`,
  editPost: (id: string) => `/admin/posts/${id}/edit`,
  resetPassword: (token: string) => `/auth/reset-password?token=${token}`,
} as const;

/**
 * TEMPLATE EXAMPLE: External links
 * Useful for social media, documentation, etc.
 */
export const externalLinks = {
  github: "https://github.com/yourusername/your-repo",
  twitter: "https://twitter.com/yourusername",
  documentation: "https://docs.yoursite.com",
  support: "https://support.yoursite.com",
  status: "https://status.yoursite.com",
} as const;
