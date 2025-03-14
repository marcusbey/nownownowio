'use client';

import { SignUpProviders } from "../../../app/auth/signup/SignUpProviders";
import { useSession, signOut } from "next-auth/react";

export function AuthCheck() {
  const { data: session, status } = useSession();
  
  // We have debug logging that can be uncommented when needed
  // Session status and data are available for debugging

  if (status === "loading") {
    return (
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="flex items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  // Check for orphaned sessions (cookie exists but user record is gone from DB)
  if (session?.isOrphanedSession) {
    // Orphaned session detected (cookie exists but user record is gone)

    // Show a friendly error with manual sign-out option
    return (
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="mb-4 rounded-lg bg-amber-100 p-4 text-sm text-amber-800">
          <p className="font-medium">Session error detected</p>
          <p className="mt-1">Your session appears to be invalid. This can happen when the database has been reset but your cookie still exists.</p>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <button 
            onClick={() => {
              try {
                // Clear any existing cookies first
                document.cookie.split(";").forEach(function(c) {
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
                });
                
                // Then sign out with redirect
                void signOut({ 
                  redirect: true,
                  callbackUrl: window.location.pathname 
                });
              } catch {
                // Handle error silently but force redirection
                // Force reload as fallback 
                window.location.href = '/auth/signin';
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
          <h3 className="mb-3 text-sm font-medium text-slate-300">Or sign in with:</h3>
          <SignUpProviders />
        </div>
      </div>
    );
  }

  // Check for sessions that are authenticated but have no user data
  if (status === "authenticated" && (!session.user?.email)) {
    // Invalid session detected (authenticated but no user data)
    
    // Show a friendly error with manual sign-out option
    return (
      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <div className="mb-4 rounded-lg bg-amber-100 p-4 text-sm text-amber-800">
          <p className="font-medium">Session error detected</p>
          <p className="mt-1">Your session appears to be authenticated but missing user data. This can happen after a server update or when session data is corrupted.</p>
        </div>
        <div className="mt-4 flex flex-col gap-3">
          <button 
            onClick={() => {
              try {
                // Clear any existing cookies first
                document.cookie.split(";").forEach(function(c) {
                  document.cookie = c.replace(/^ +/, "").replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
                });
                
                // Then sign out with redirect
                void signOut({ 
                  redirect: true,
                  callbackUrl: window.location.pathname 
                });
              } catch {
                // Handle error silently but force redirection
                // Force reload as fallback 
                window.location.href = '/auth/signin';
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
          <h3 className="mb-3 text-sm font-medium text-slate-300">Or sign in with:</h3>
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

