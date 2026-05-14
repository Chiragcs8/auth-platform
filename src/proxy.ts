import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { PUBLIC_ROUTES, AUTH_ROUTES, ROLE_ROUTE_PREFIX, ROLE_DASHBOARD_MAP } from "@/config/constants";
import type { RoleName } from "@/types";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip proxy for static files, API routes, and _next
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes("/static") ||
    pathname.match(/\.(png|jpg|jpeg|gif|svg|ico|css|js)$/)
  ) {
    return NextResponse.next();
  }

  // Get access token from cookies
  const accessToken = req.cookies.get("access_token")?.value;

  // Verify session
  let session = null;
  if (accessToken) {
    session = await verifyAccessToken(accessToken);
  }

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // ─── Redirect authenticated users away from auth pages ──────
  if (session && isAuthRoute) {
    const roleName = session.roleName as RoleName;
    const dashboardUrl = ROLE_DASHBOARD_MAP[roleName] || "/client/dashboard";
    return NextResponse.redirect(new URL(dashboardUrl, req.nextUrl));
  }

  // ─── Redirect unauthenticated users to login ───────────────
  if (!session && !isPublicRoute) {
    const loginUrl = new URL("/login", req.nextUrl);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // ─── Role-based route protection ────────────────────────────
  if (session) {
    const roleName = session.roleName as RoleName;
    const allowedPrefix = ROLE_ROUTE_PREFIX[roleName];

    // Check if user is trying to access a route outside their role scope
    const isRoleRoute = pathname.startsWith(allowedPrefix);

    if (!isRoleRoute && !isPublicRoute && !isAuthRoute) {
      // User is trying to access another role's dashboard
      const dashboardUrl = ROLE_DASHBOARD_MAP[roleName] || "/client/dashboard";
      return NextResponse.redirect(new URL(dashboardUrl, req.nextUrl));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};