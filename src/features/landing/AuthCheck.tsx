"use client";

import { signOut, useSession } from "next-auth/react";
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

  if (hasSessionError) {
    // Show a friendly error with manual sign-out option
    return (
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="mb-4 rounded-lg bg-amber-100 p-4 text-sm text-amber-800">
          <p className="font-medium">Session error detected</p>
          <p className="mt-1">
            Your session appears to be authenticated but missing user data. This
            can happen after a server update or when session data is corrupted.
          </p>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <button
            onClick={() => {
              try {
                // Clear all cookies to ensure complete session cleanup
                document.cookie.split(";").forEach(function (c) {
                  document.cookie = c
                    .replace(/^ +/, "")
                    .replace(
                      /=.*/,
                      `=;expires=${new Date().toUTCString()};path=/`,
                    );
                });

                // Force a complete sign out with redirect
                void signOut({
                  redirect: true,
                  callbackUrl: "/auth/signin",
                });
              } catch (error) {
                console.error("Error during sign out:", error);
                // Force reload as fallback
                window.location.href = "/auth/signin";
              }
            }}
            className="w-full rounded-md bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700"
          >
            Sign Out and Reconnect
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-md bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-600"
          >
            Refresh Page
          </button>
        </div>
        <div className="mt-6 border-t border-slate-800 pt-6">
          <h3 className="mb-3 text-sm font-medium text-slate-300">
            Or sign in with:
          </h3>
          <SignUpProviders />
        </div>
      </div>
    );
  }

  if (!session) {
    // No session found, showing SignUpProviders
    return (
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <SignUpProviders />
      </div>
    );
  }

  // Valid session found with user data, render nothing here
  return null;
}
