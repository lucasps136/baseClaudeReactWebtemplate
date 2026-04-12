import { NextRequest, NextResponse } from "next/server";

import {
  isAdminRoute,
  isAuthRoute,
  isProtectedRoute,
  redirects,
} from "@/config/routes";

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
 * Reads the Supabase session token from cookies.
 * NOTE: requires @supabase/ssr and createServerClient to set cookies automatically.
 * With the current @supabase/supabase-js client-only setup, the session is stored
 * in localStorage and is not accessible here. Install @supabase/ssr and replace
 * this function with a createServerClient call for full server-side protection.
 */
const getSessionToken = (request: NextRequest): string | undefined => {
  // Supabase SSR sets this cookie when using @supabase/ssr
  return request.cookies.get("sb-access-token")?.value;
};

/**
 * Middleware for route protection and security headers
 */
export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (shouldSkipMiddleware(pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  addSecurityHeaders(response);

  const sessionToken = getSessionToken(request);

  if (isProtectedRoute(pathname)) {
    if (!sessionToken) {
      return NextResponse.redirect(
        new URL(redirects.unauthorized, request.url),
      );
    }

    if (isAdminRoute(pathname)) {
      const userRole = request.cookies.get("user-role")?.value;
      if (userRole !== "admin") {
        return NextResponse.redirect(
          new URL(redirects.adminRequired, request.url),
        );
      }
    }
  }

  if (isAuthRoute(pathname) && sessionToken) {
    return NextResponse.redirect(new URL(redirects.afterLogin, request.url));
  }

  return response;
}

/**
 * Configure which paths the middleware should run on
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\..*).*)"],
};
