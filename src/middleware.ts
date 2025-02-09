import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth();

  // Allow public routes
  if (
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/api/auth") ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname === "/home" ||
    request.nextUrl.pathname.startsWith("/auth")
  ) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!session) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
