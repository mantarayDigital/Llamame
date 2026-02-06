import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth middleware stub.
 *
 * When an auth provider is integrated (Clerk, Auth0, Convex Auth, etc.),
 * this middleware will:
 * 1. Check for a valid session token on protected routes
 * 2. Redirect unauthenticated users to /auth/login
 * 3. Redirect authenticated users away from /auth/* pages
 * 4. Attach user/org context to the request
 *
 * Protected routes: /dashboard/*
 * Public routes: /, /booking, /[handle], /[handle]/[slug], /auth/*
 */

const PROTECTED_PREFIXES = ["/dashboard"];
const AUTH_ROUTES = ["/auth/login", "/auth/signup"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // TODO: Replace with real auth check
  // Example with Clerk: const { userId } = getAuth(request);
  const isAuthenticated = true; // Stub: always authenticated for now

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    // Already logged in, send to dashboard
    // return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
