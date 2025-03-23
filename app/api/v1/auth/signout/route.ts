import { baseAuth } from "@/lib/auth/auth";
import { logger } from "@/lib/logger";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Server-side sign-out endpoint that properly invalidates the session
 * This ensures the cookie is cleared server-side, bypassing HTTP-only limitations
 */
export async function POST() {
  try {
    // Get the current session
    const session = await baseAuth();
    
    // Log the sign-out attempt for debugging
    logger.info("Server-side sign-out requested", { 
      userId: session?.user?.id || "unknown",
      hasSession: !!session
    });

    // Get all cookies to find auth-related ones
    const cookieStore = cookies();
    const cookieNames = cookieStore.getAll().map(cookie => cookie.name);
    
    // Create a response that will clear auth cookies
    const response = NextResponse.json({ success: true, message: "Signed out successfully" });
    
    // Clear all potential auth-related cookies
    cookieNames.forEach(name => {
      if (name.includes("next-auth") || name.includes("session") || name.includes("token")) {
        response.cookies.delete(name);
        logger.info(`Deleted cookie: ${name}`);
      }
    });

    return response;
  } catch (error) {
    logger.error("Error during server-side sign-out", { error });
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    );
  }
}
