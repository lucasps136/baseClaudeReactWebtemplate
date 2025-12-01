import { NextRequest, NextResponse } from "next/server";

// Commented out until authentication is implemented
// import {
//   isProtectedRoute,
//   isAuthRoute,
//   isAdminRoute,
//   redirects,
// } from "@/config/routes";

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
  // Get pathname from the request URL
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/public") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Security headers for all requests
  const response = NextResponse.next();

  // Add security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

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

  // EXAMPLE: Locale/internationalization handling
  /*
  const locales = ['en', 'pt', 'es'];
  const defaultLocale = 'en';

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (!pathnameHasLocale) {
    // Get locale from Accept-Language header or use default
    const locale = request.headers.get('accept-language')?.split(',')[0]?.split('-')[0] || defaultLocale;
    const supportedLocale = locales.includes(locale) ? locale : defaultLocale;

    return NextResponse.redirect(
      new URL(`/${supportedLocale}${pathname}`, request.url)
    );
  }
  */

  // EXAMPLE: A/B testing
  /*
  const bucket = Math.random() < 0.5 ? 'a' : 'b';
  response.cookies.set('bucket', bucket);
  */

  // EXAMPLE: Rate limiting (basic implementation)
  /*
  const ip = request.ip || 'unknown';
  const rateLimit = 10; // requests per minute
  const windowMs = 60 * 1000; // 1 minute

  // In a real implementation, use Redis or database
  // This is just for demonstration
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
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
