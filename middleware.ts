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
     * - orgs/[orgSlug]/invitations/[token] (invitation links)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|admin|orgs/[^/]+/invitations/[^/]+).*)",
  ],
};

export function middleware(req: NextRequest) {
  // Inject the current URL inside the request headers
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);

  // Get the session token from cookies
  const authCookie = req.cookies.get(AUTH_COOKIE_NAME);

  // Get the current path and URL
  const { pathname } = req.nextUrl;
  const url = new URL(req.url);

  // Skip middleware for API routes and auth-related API routes
  if (pathname.startsWith('/api/')) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Allow access to auth pages during the auth flow
  if (pathname.startsWith('/auth/') && (
    url.searchParams.has('callbackUrl') ||
    url.searchParams.has('error') ||
    pathname.includes('error') ||
    pathname.includes('verify-request')
  )) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Skip auth check for invitation links
  if (pathname.match(/^\/orgs\/[^/]+\/invitations\/[^/]+$/)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // If user is not authenticated and trying to access protected routes
  if (!authCookie?.value && pathname.startsWith('/orgs')) {
    return NextResponse.redirect(new URL('/auth/signin', req.url));
  }

  // If user is authenticated
  if (authCookie?.value) {
    // Redirect from landing page to orgs
    if (pathname === '/' && SiteConfig.features.enableLandingRedirection) {
      return NextResponse.redirect(new URL('/orgs', req.url));
    }

    // Redirect from auth pages if already authenticated
    if (pathname.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/orgs', req.url));
    }
  }

  // Always clean up isNewUser parameter
  if (url.searchParams.has('isNewUser')) {
    url.searchParams.delete('isNewUser');
    if (authCookie?.value) {
      return NextResponse.redirect(new URL('/orgs', req.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
