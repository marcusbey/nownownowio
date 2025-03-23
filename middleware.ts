import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import { AUTH_COOKIE_NAME } from "@/lib/auth/auth.const";
import { SiteConfig } from "@/site-config";
import { logger } from "@/lib/logger";
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
  // Use structured logging instead of console.log
  logger.info(`Middleware running`, { 
    pathname: req.nextUrl.pathname,
    hasAuthCookie: false // Will be updated below
  });

  // Inject the current URL inside the request headers
  // Useful to get the parameters of the current request
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-url", req.url);

  const { pathname } = req.nextUrl;
  const cookieList = await cookies();
  const authCookie = cookieList.get(AUTH_COOKIE_NAME);

  // Update log with auth cookie status
  logger.info(`Auth status`, { 
    hasAuthCookie: !!authCookie,
    pathname
  });

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

  // Enhanced session validation for protected routes
  if (isProtectedRoute) {
    // First check if the auth cookie exists
    if (!authCookie) {
      logger.info('Middleware - No auth cookie found for protected route', { pathname });
      // Redirect unauthenticated users to the landing page (root URL)
      const url = new URL('/auth/signin', req.url);
      url.searchParams.set('callbackUrl', req.url);
      return NextResponse.redirect(url.toString());
    }
    
    // For additional security, validate the session on the server for protected routes
    // This helps detect orphaned sessions (cookie exists but session is invalid)
    try {
      // Only do this check for fully protected routes, not for routes that might have both public and private parts
      const requiresStrictValidation = [
        '/settings',
        '/messages',
        '/notifications'
      ].some(route => pathname === route || pathname.startsWith(`${route}/`));
      
      if (requiresStrictValidation) {
        // Call a lightweight session validation endpoint
        const response = await fetch(`${req.nextUrl.origin}/api/v1/auth/validate`, {
          headers: {
            Cookie: `${AUTH_COOKIE_NAME}=${authCookie.value}`,
          },
          cache: 'no-store' // Ensure we don't get a cached response
        });
        
        if (!response.ok) {
          logger.warn('Middleware - Invalid session detected', { 
            pathname,
            status: response.status
          });
          
          // Clear the invalid cookie and redirect to sign-in
          const url = new URL('/auth/signin', req.url);
          url.searchParams.set('error', 'SessionExpired');
          const redirectResponse = NextResponse.redirect(url.toString());
          redirectResponse.cookies.delete(AUTH_COOKIE_NAME);
          return redirectResponse;
        }
      }
    } catch (error) {
      // Log the error but don't block the request - fail open for better UX
      logger.error('Middleware - Error validating session', { 
        error: error instanceof Error ? error.message : String(error),
        pathname
      });
      // Continue to the page - the client-side AuthCheck component will handle invalid sessions
    }
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
          // Redirect to organization page
          return NextResponse.redirect(url.toString());
        }

        // Fallback to orgs page if no organization found
        const url = new URL(req.url);
        url.pathname = "/orgs";
        // Redirect to orgs page if no specific organization found
        return NextResponse.redirect(url.toString());
      } catch (error) {
        // Silently handle error
        // Continue to the page if there's an error fetching the organization
      }
    }
  }

  // Proceed to the requested page
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}
