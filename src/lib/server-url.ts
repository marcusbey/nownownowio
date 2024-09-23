import { SiteConfig } from "@/site-config";

/**
 * This method returns the server URL based on the environment.
 */
export const getServerUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (process.env.NODE_ENV === "production") {
    return process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : SiteConfig.prodUrl;
  }

  return process.env.NEXTAUTH_URL?.replace(/\/+$/, "") || "http://localhost:3000";
};
