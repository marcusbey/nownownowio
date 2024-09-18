import { AUTH_COOKIE_NAME } from "@/lib/auth/auth.const";
import { SiteConfig } from "@/site-config";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - admin (admin path)
     * - orgs and orgs/new to prevent redirect loops
     */
    "/((?!api|_next/static|_next/image|favicon.ico|admin|orgs|orgs/new).*)",
  ],
};

export function middleware(req: NextRequest) {
  // Inject the current URL inside the request headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);

  // Redirect to /orgs if accessing the root and landing redirection is enabled
  if (
    req.nextUrl.pathname === "/" &&
    SiteConfig.features.enableLandingRedirection
  ) {
    const cookieList = cookies();
    const authCookie = cookieList.get(AUTH_COOKIE_NAME);

    if (authCookie) {
      const url = new URL(req.url);
      url.pathname = "/orgs";
      return NextResponse.redirect(url.toString(), { headers: requestHeaders });
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
