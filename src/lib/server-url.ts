import { SiteConfig } from "@/site-config";

/**
 * This method return the server URL based on the environment.
 */
export const getServerUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // If we are in production, we return the production URL.
  if (process.env.VERCEL_ENV === "production") {
    return SiteConfig.prodUrl;
  }

  // If we are in "stage" environment, we return the staging URL.
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  // If we are in development, we return the localhost URL with the correct port.
  // First check if we have a PORT environment variable
  const port = process.env.PORT ?? process.env.NEXT_PUBLIC_PORT ?? 3005;
  return `http://localhost:${port}`;
};
