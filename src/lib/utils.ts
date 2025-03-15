import { type ClassValue, clsx } from "clsx";
import { formatDate, formatDistanceToNowStrict } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeDate(from: Date | string | null | undefined): string {
  // Handle null, undefined, or invalid date
  if (!from) {
    return 'Unknown date';
  }
  
  // Convert string to Date if needed
  const fromDate = typeof from === 'string' ? new Date(from) : from;
  
  // Check if date is valid
  if (!(fromDate instanceof Date) || isNaN(fromDate.getTime())) {
    return 'Invalid date';
  }
  
  const currentDate = new Date();
  if (currentDate.getTime() - fromDate.getTime() < 24 * 60 * 60 * 1000) {
    return formatDistanceToNowStrict(fromDate, { addSuffix: true });
  } else {
    if (currentDate.getFullYear() === fromDate.getFullYear()) {
      return formatDate(fromDate, "MMM d");
    } else {
      return formatDate(fromDate, "MMM d, yyyy");
    }
  }
}

/**
 * Safely extracts user data from a session object, handling potential string representation issues
 * @param session The session object from useSession() hook
 * @param status The status from useSession() hook
 * @returns The extracted user data or null if not available
 */
export function extractUserFromSession(session: any, status: string) {
  // If we already have user data in the expected format, return it
  if (status === "authenticated" && session?.user) {
    return session.user;
  }
  
  // No session or not authenticated
  if (!session || status !== "authenticated") {
    return null;
  }
  
  try {
    // Try to parse the session if it's a string or has unexpected structure
    const sessionStr = JSON.stringify(session);
    
    // Check if this looks like a session object with user data
    if (sessionStr.includes('"user"') || sessionStr.includes('"id"')) {
      // Handle case where session might be a string representation
      const parsedSession = sessionStr.startsWith('"') 
        ? JSON.parse(JSON.parse(sessionStr)) 
        : session;
      
      // If we have a user object after parsing, return it
      if (parsedSession?.user) {
        return parsedSession.user;
      }
      
      // If the session itself might be the user object
      if (parsedSession?.id && (parsedSession?.email || parsedSession?.name)) {
        return parsedSession;
      }
    }
    
    // Special case: if session appears to be the direct user object
    if (session.id && (session.email || session.name)) {
      return session;
    }
    
    // Log for debugging in development
    if (process.env.NODE_ENV === "development") {
      console.log("Session parsing attempted but failed:", {
        sessionType: typeof session,
        sessionKeys: Object.keys(session),
        sessionPreview: sessionStr.substring(0, 100)
      });
    }
  } catch (error) {
    console.error("Error extracting user from session:", error);
  }
  
  return null;
}

export function formatNumber(n: number): string {
  return Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^a-z0-9-]/g, "");
}
