import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public routes that do not require authentication
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password"];

// Admin-only route prefix
const ADMIN_PREFIX = "/admin";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes and Next.js internals
  if (
    PUBLIC_ROUTES.some((r) => pathname === r || pathname.startsWith("/_next") || pathname.startsWith("/api")) ||
    pathname.match(/\.(ico|png|svg|jpg|jpeg|gif|webp|css|js|woff|woff2|ttf)$/)
  ) {
    return NextResponse.next();
  }

  // Read session cookie set by Firebase Auth (session token stored as __session)
  const session = request.cookies.get("__session")?.value;
  const role = request.cookies.get("__role")?.value;

  // Not authenticated
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access
  const isAdminOrAbove = role === "admin" || role === "super_admin";
  if (pathname.startsWith("/admin/super") && role !== "super_admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  if (pathname.startsWith(ADMIN_PREFIX) && !isAdminOrAbove) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
