import { NextRequest } from "next/server";

/**
 * Get client IP address from request
 * Handles various headers that might contain the real IP
 */
export function getClientIp(request: NextRequest): string {
  // Try to get IP from Cloudflare headers first
  const cfConnectingIp = request.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  // Try X-Forwarded-For header
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Get the first IP in the list
    return forwardedFor.split(",")[0].trim();
  }

  // Try X-Real-IP header
  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to the direct IP
  const ip = request.ip ?? request.headers.get("remote-addr") ?? "unknown";
  return ip;
}
