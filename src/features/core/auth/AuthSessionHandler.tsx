"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { logger } from "@/lib/logger";
import { cleanupSession } from "@/lib/auth/cleanup";

export function AuthSessionHandler() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // @ts-expect-error - Check for our custom flag
    if (status === "authenticated" && session?.isOrphanedSession) {
      logger.warn("Client-side orphaned session detected. Forcing sign out and cleanup.");
      
      // Perform a full cleanup
      cleanupSession("/auth/signin?error=SessionExpired");
    }
  }, [session, status]);

  // This component doesn't render anything itself
  return null;
}
