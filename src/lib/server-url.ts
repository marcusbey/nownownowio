import { SiteConfig } from "@/site-config";
import { env } from "@/lib/env";

/**
 * This method returns the server URL based on the environment.
 */
export const getServerUrl = () => {
  // In the browser, always use the current origin
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // For server-side rendering and API routes
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // Use NEXT_PUBLIC_BASE_URL from env
  return env.NEXT_PUBLIC_BASE_URL;
};
