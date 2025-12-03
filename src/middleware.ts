import { NextRequest, NextResponse } from "next/server";

/**
 * Adds security headers to response
 * SRP: Responsible only for setting security headers
 */
const addSecurityHeaders = (response: NextResponse): void => {
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
};

/**
 * Checks if request should skip middleware
 * SRP: Responsible only for determining if middleware should run
 */
const shouldSkipMiddleware = (pathname: string): boolean => {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.includes(".")
  );
};

/**
 * Middleware for handling routing, authentication, and redirects
 * This runs before every request and is essential for:
 * - Route protection
 * - Authentication checks
 * - Redirects and rewrites
 * - Request/response modifications
 *
 * TEMPLATE NOTE: Uncomment and modify the authentication logic based on your auth provider
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that don't need auth
  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  // Security headers for all requests
  const response = NextResponse.next();
  addSecurityHeaders(response);

  // EXAMPLE: Route protection using centralized configuration
  // Uncomment and modify based on your authentication strategy

  /*
  // Import route helpers first:
  // import { isProtectedRoute, isAuthRoute, isAdminRoute, redirects } from "@/config/routes";

  // Check if route requires authentication
  if (isProtectedRoute(pathname)) {
    // EXAMPLE: Check for authentication token/session
    const token = request.cookies.get('auth-token')?.value;
    const session = request.cookies.get('next-auth.session-token')?.value;

    if (!token && !session) {
      // Redirect to login page
      return NextResponse.redirect(
        new URL(redirects.unauthorized, request.url)
      );
    }

    // EXAMPLE: Admin route protection
    if (isAdminRoute(pathname)) {
      const userRole = request.cookies.get('user-role')?.value;

      if (userRole !== 'admin') {
        return NextResponse.redirect(
          new URL(redirects.adminRequired, request.url)
        );
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname)) {
    const token = request.cookies.get('auth-token')?.value;
    const session = request.cookies.get('next-auth.session-token')?.value;

    if (token || session) {
      return NextResponse.redirect(
        new URL(redirects.afterLogin, request.url)
      );
    }
  }
  */

  return response;
}

/**
 * Configure which paths the middleware should run on
 * Use negative lookaheads to exclude specific paths
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\..*).*)",
  ],
};
