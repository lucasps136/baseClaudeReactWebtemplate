/**
 * TDD Tests for injectRouteConfig()
 * These tests should FAIL initially until T006 implements the function.
 */
const path = require("path");

jest.mock("fs");
const fs = require("fs");

const routeCliUtils = require("../../../scripts/utils/route-cli-utils");

// Sample routes.ts content matching the actual project structure (mirrors src/config/routes.ts)
const SAMPLE_ROUTES_TS = `export const routes = {
  // Public routes (no authentication required)
  public: {
    home: "/",
    about: "/about",
    contact: "/contact",
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
    },
  },
} as const;

export const routeGroups = {
  // Routes that require authentication
  protected: [
    routes.protected.dashboard,
    routes.protected.profile,
    routes.protected.settings,
    routes.protected.billing,
    ...Object.values(routes.protected.admin),
  ],
} as const;
`;

describe("injectRouteConfig", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(SAMPLE_ROUTES_TS);
    fs.writeFileSync.mockReturnValue(undefined);
  });

  test("injects into routes.protected and routeGroups.protected when isProtected=true", () => {
    const result = routeCliUtils.injectRouteConfig(
      "automacoes",
      "/automacoes",
      true,
    );

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalled();

    const writtenContent = fs.writeFileSync.mock.calls[0][1];
    expect(writtenContent).toContain('automacoes: "/automacoes",');
    // Should be in the protected object block
    expect(writtenContent).toMatch(/protected:\s*\{[\s\S]*automacoes/);
    // Should also be appended to routeGroups.protected array
    expect(writtenContent).toContain('"/automacoes",');
  });

  test("injects into routes.public when isProtected=false", () => {
    const result = routeCliUtils.injectRouteConfig(
      "automacoes",
      "/automacoes",
      false,
    );

    expect(result).toBe(true);
    expect(fs.writeFileSync).toHaveBeenCalled();

    const writtenContent = fs.writeFileSync.mock.calls[0][1];
    expect(writtenContent).toContain('automacoes: "/automacoes",');
    // Should be in the public object block
    expect(writtenContent).toMatch(/public:\s*\{[\s\S]*automacoes/);
  });

  test("is idempotent — does not duplicate if route already exists", () => {
    const contentWithRoute = SAMPLE_ROUTES_TS.replace(
      'dashboard: "/dashboard",',
      'dashboard: "/dashboard",\n    automacoes: "/automacoes",',
    );
    fs.readFileSync.mockReturnValue(contentWithRoute);

    const result = routeCliUtils.injectRouteConfig(
      "automacoes",
      "/automacoes",
      true,
    );

    expect(result).toBe(true);
    // Should NOT write the file again since it already exists
    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  test("returns false with fallback when pattern not found", () => {
    fs.readFileSync.mockReturnValue("// empty file with no patterns");

    const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

    const result = routeCliUtils.injectRouteConfig(
      "automacoes",
      "/automacoes",
      true,
    );

    expect(result).toBe(false);
    expect(consoleSpy).toHaveBeenCalled();
  });
});
