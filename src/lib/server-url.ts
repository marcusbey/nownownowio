import { SiteConfig } from "@/site-config";

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

  // Fallback to NEXTAUTH_URL or localhost
  const nextAuthUrl = process.env.NEXTAUTH_URL?.replace(/\/+$/, "");
  if (nextAuthUrl) {
    // Ensure URL uses HTTPS unless it's localhost
    return nextAuthUrl.startsWith('http://localhost') 
      ? nextAuthUrl 
      : nextAuthUrl.replace('http://', 'https://');
  }

  return "http://localhost:3000";
};
