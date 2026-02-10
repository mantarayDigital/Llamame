import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Simplified middleware.
 *
 * Auth protection is handled client-side by AuthGuard since @convex-dev/auth
 * uses client-side token storage (not cookies), making server-side middleware
 * auth checks impractical. This middleware is kept as a passthrough for future
 * needs (rate limiting, geo routing, etc.).
 */

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
