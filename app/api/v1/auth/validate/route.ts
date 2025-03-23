import { baseAuth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

/**
 * Lightweight session validation endpoint
 * Used by middleware to validate sessions without redirecting
 * Returns 200 if the session is valid, 401 if not
 */
export async function GET() {
  try {
    // Get the current session
    const session = await baseAuth();
    
    // Log validation attempt for debugging
    logger.info("Session validation requested", { 
      hasSession: !!session,
      userId: session?.user?.id || "unknown",
      isOrphanedSession: session ? 'isOrphanedSession' in session : false
    });

    // Check if session exists and has a valid user
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json(
        { error: "Invalid session" },
        { status: 401 }
      );
    }

    // Check for orphaned session flag
    if ('isOrphanedSession' in session && session.isOrphanedSession) {
      logger.warn("Orphaned session detected during validation", {
        userId: session.user.id
      });
      
      return NextResponse.json(
        { error: "Orphaned session" },
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
