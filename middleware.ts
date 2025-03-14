import { ENDPOINTS } from "@/lib/api/apiEndpoints";
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
     */
    "/((?!api|_next/static|_next/image|_next/data|favicon.ico|admin).*)",
  ],
};

export async function middleware(req: NextRequest) {
  // Debug logging
  console.log(`Middleware running for: ${req.nextUrl.pathname}`);

  // Inject the current URL inside the request headers
  // Useful to get the parameters of the current request
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);

  const { pathname } = req.nextUrl;
  const cookieList = await cookies();
  const authCookie = cookieList.get(AUTH_COOKIE_NAME);

  console.log(`Auth cookie present: ${!!authCookie}`);

  // Check if user is authenticated for protected routes
  // Protected routes include:
  // - /orgs/* - Organization pages
  // - /settings/* - User settings
  // - /posts/* - Post detail pages
  // - /messages/* - User messages
  // - /profile/* - User profile pages
  // - /notifications/* - User notifications
  // - /@* - User profile pages
  const protectedRoutes = [
    '/orgs',
    '/settings',
    '/posts',
    '/messages',
    '/profile',
    '/notifications',
    '/@'
  ];

  // Fix: Remove the trailing slashes for more accurate matching
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !authCookie) {
    // Redirect unauthenticated users to the landing page (root URL)
    const url = new URL('/', req.url);
    return NextResponse.redirect(url.toString());
  }

  // This settings is used to redirect the user to the organization page if he is logged in
  // The landing page is still accessible with the /home route
  if (
    req.nextUrl.pathname === "/" &&
    SiteConfig.features.enableLandingRedirection
  ) {
    if (authCookie) {
      // Get user's first organization from the database
      try {
        const response = await fetch(`${req.nextUrl.origin}${ENDPOINTS.ORGANIZATION_FIRST}`, {
          headers: {
            Cookie: `${AUTH_COOKIE_NAME}=${authCookie.value}`,
          },
        });

        if (response.ok) {
          const { slug } = await response.json();
          const url = new URL(req.url);
          url.pathname = `/orgs/${slug}`;
          console.log(`Redirecting to org: ${url.pathname}`);
          return NextResponse.redirect(url.toString());
        }

        // Fallback to orgs page if no organization found
        const url = new URL(req.url);
        url.pathname = "/orgs";
        console.log(`No org found, redirecting to: ${url.pathname}`);
        return NextResponse.redirect(url.toString());
      } catch (error) {
        console.error("Error redirecting authenticated user:", error);
        // Continue to the page if there's an error fetching the organization
      }
    }
  }

  console.log('Middleware complete, continuing to page');
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
