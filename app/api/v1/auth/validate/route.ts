import { baseAuth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

/**
 * Lightweight session validation endpoint
 * Used by middleware to validate sessions without redirecting
 * Returns 200 if the session is valid, 401 if not
 * 
 * Compatible with Next.js 15 session handling
 */
export async function GET() {
  try {
    // Get the current session (Next.js 15 compatible)
    const session = await baseAuth();
    
    // Enhanced logging for better debugging
    logger.info("Session validation requested", { 
      hasSession: !!session,
      userId: session?.user?.id ?? "unknown",
      isOrphanedSession: 'isOrphanedSession' in (session ?? {}),
      userInvalid: 'isInvalid' in (session?.user ?? {})
    });

    // Check if session exists and has a valid user
    if (!session?.user?.id) {
      logger.warn("Session validation failed - missing session or user data");
      return NextResponse.json(
        { error: "Invalid session", code: "SESSION_INVALID" },
        { status: 401 }
      );
    }

    // Check for orphaned session flag
    if ('isOrphanedSession' in session && session.isOrphanedSession) {
      logger.warn("Orphaned session detected during validation", {
        userId: session.user.id
      });
      
      return NextResponse.json(
        { error: "Orphaned session", code: "SESSION_ORPHANED" },
        { status: 401 }
      );
    }
    
    // Check for explicitly marked invalid user data
    if ('isInvalid' in session.user && session.user.isInvalid) {
      logger.warn("Invalid user data detected during validation", {
        userId: session.user.id
      });
      
      return NextResponse.json(
        { error: "Invalid user data", code: "USER_DATA_INVALID" },
        { status: 401 }
      );
    }

    // Session is valid
    return NextResponse.json({ 
      valid: true,
      userId: session.user.id
    });
  } catch (error) {
    logger.error("Error during session validation", { 
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: "Session validation failed" },
      { status: 500 }
    );
  }
}
