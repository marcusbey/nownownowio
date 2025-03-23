"use client";

import { useSession } from "next-auth/react";
import { SignUpProviders } from "../../../app/auth/signup/SignUpProviders";

export function AuthCheck() {
  // Use useSession hook for client-side authentication
  const { data: session, status } = useSession();

  // Debug logging is commented out for production
  // Uncomment when troubleshooting session issues
  /*
  console.log("AuthCheck - session data:", {
    status,
    hasSession: !!session,
    hasUser: !!session?.user,
    userEmail: session?.user?.email,
    sessionKeys: session ? Object.keys(session) : [],
    userKeys: session?.user ? Object.keys(session.user) : []
  });
  */

  if (status === "loading") {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Enhanced session validation logic
  // Check for orphaned sessions (cookie exists but user record is gone from DB)
  // OR sessions that are authenticated but missing critical user data
  const hasSessionError =
    // @ts-expect-error - isOrphanedSession is added by our custom auth handler
    session?.isOrphanedSession ||
    (status === "authenticated" && (!session.user?.id || !session.user.email));

  // For both hasSessionError and no session, show the sign-up providers
  if (hasSessionError || !session) {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <SignUpProviders />
      </div>
    );
  }

  // This block is now handled by the combined condition above

  // Valid session found with user data, render nothing here
  return null;
}
