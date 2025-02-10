import { AUTH_COOKIE_NAME } from "@/lib/auth/auth.const";
import { SiteConfig } from "@/config";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Add type safety for public paths
const PUBLIC_PATHS = [
  '/auth/signin',
  '/auth/signup',
  '/auth/verify-request',
  '/auth/error',
] as const;

// Add type for protected routes
const PROTECTED_ROUTES = ['/orgs'] as const;

// Keep the original config with improved type safety
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
} as const;

export function middleware(req: NextRequest) {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);

  const authCookie = req.cookies.get(AUTH_COOKIE_NAME);
  const { pathname } = req.nextUrl;
  const url = new URL(req.url);

  // Helper function for consistent response with headers
  const nextWithHeaders = () => NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Check if path is public
  const isPublicPath = PUBLIC_PATHS.includes(pathname as any);
  
  // Skip middleware for API routes
  if (pathname.startsWith('/api/')) {
    return nextWithHeaders();
  }

  // Handle auth flow pages
  if (pathname.startsWith('/auth/') && (
    url.searchParams.has('callbackUrl') ||
    url.searchParams.has('error') ||
    pathname.includes('error') ||
    pathname.includes('verify-request') ||
    isPublicPath
  )) {
    return nextWithHeaders();
  }

  // Skip auth check for invitation links
  if (pathname.match(/^\/orgs\/[^/]+\/invitations\/[^/]+$/)) {
    return nextWithHeaders();
  }

  // Protected routes authentication check
  if (!authCookie?.value && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const signInUrl = new URL('/auth/signin', req.url);
    signInUrl.searchParams.set('callbackUrl', req.url);
    signInUrl.searchParams.set('error', 'Unauthenticated');
    return NextResponse.redirect(signInUrl);
  }

  // Authenticated user redirections
  if (authCookie?.value) {
    if (pathname === '/' && SiteConfig.features.enableLandingRedirection) {
      return NextResponse.redirect(new URL('/orgs', req.url));
    }

    if (pathname.startsWith('/auth/')) {
      return NextResponse.redirect(new URL('/orgs', req.url));
    }
  }

  // Clean up isNewUser parameter
  if (url.searchParams.has('isNewUser')) {
    url.searchParams.delete('isNewUser');
    if (authCookie?.value) {
      return NextResponse.redirect(new URL('/orgs', req.url));
    }
  }

  return nextWithHeaders();
}