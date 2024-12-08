import { NextRequest } from 'next/server';

export function getClientIp(request: NextRequest): string {
  // Try to get the IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }

  // Fall back to connection remote address
  return request.ip || 'unknown';
}
