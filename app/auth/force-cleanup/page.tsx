"use client";

import { Button } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { useEffect, useState } from "react";

/**
 * This is a special reset page that ensures all session data is completely wiped
 * Can be accessed at /auth/force-cleanup
 */
export default function ForceCleanupPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [cleaning, setCleaning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Auto-start cleanup when page loads
  useEffect(() => {
    startCleanup();
  }, []);

  // Countdown to redirect after cleanup completes
  useEffect(() => {
    if (completed && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    if (completed && countdown === 0) {
      window.location.href = "/auth/signin";
    }
  }, [completed, countdown]);

  async function startCleanup() {
    if (cleaning) return;

    setCleaning(true);
    setStatus([]);

    try {
      addStatus("🧹 Starting session cleanup...");

      // 1. Clear cookies
      addStatus("Clearing cookies...");
      await clearCookies();

      // 2. Clear localStorage and sessionStorage
      addStatus("Clearing browser storage...");
      clearBrowserStorage();

      // 3. Clear IndexedDB if possible
      addStatus("Checking for IndexedDB data...");
      await clearIndexedDB();

      // Success!
      addStatus("✅ Cleanup completed successfully!");
      addStatus(`Redirecting to login in ${countdown} seconds...`);
      setCompleted(true);
    } catch (error) {
      addStatus(
        `❌ Error during cleanup: ${error instanceof Error ? error.message : String(error)}`,
      );
      setCleaning(false);
    }
  }

  function addStatus(message: string) {
    setStatus((prev) => [...prev, message]);
  }

  async function clearCookies() {
    const cookiePaths = ["/", "/api", "/auth"];
    const domains = ["", window.location.hostname];

    // Get all cookies
    const cookies = document.cookie.split(";").map((cookie) => cookie.trim());

    for (const cookie of cookies) {
      if (!cookie) continue;
      const cookieName = cookie.split("=")[0];

      // Skip clearing non-auth related cookies
      if (
        !cookieName.includes("next-auth") &&
        !cookieName.includes("__Secure") &&
        !cookieName.includes("__Host") &&
        !cookieName.includes("session")
      ) {
        continue;
      }

      addStatus(`Clearing cookie: ${cookieName}`);

      // Clear cookie with all possible path/domain combinations
      for (const path of cookiePaths) {
        for (const domain of domains) {
          // Standard version
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ""}`;

          // Secure version
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${path}${domain ? `; domain=${domain}` : ""}; secure`;
        }
      }
    }
  }

  function clearBrowserStorage() {
    try {
      // Clear localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes("next-auth") || key.includes("session"))) {
          addStatus(`Clearing localStorage key: ${key}`);
          localStorage.removeItem(key);
        }
      }

      // Alternative approach - clear everything
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      addStatus("Browser storage cleared");
    } catch (error) {
      addStatus(
        `Error clearing browser storage: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function clearIndexedDB() {
    if (!window.indexedDB) {
      addStatus("IndexedDB not available in this browser");
      return;
    }

    // Try to open and clear any auth-related databases
    const dbNames = ["next-auth", "local-forage"];

    for (const dbName of dbNames) {
      try {
        const request = indexedDB.deleteDatabase(dbName);
        await new Promise((resolve, reject) => {
          request.onsuccess = () => {
            addStatus(`Cleared IndexedDB database: ${dbName}`);
            resolve(true);
          };
          request.onerror = () => {
            addStatus(`Failed to clear IndexedDB database: ${dbName}`);
            resolve(false);
          };
        });
      } catch (error) {
        addStatus(
          `Error with IndexedDB database ${dbName}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  return (
    <div className="container flex flex-col items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Session Force Cleanup</CardTitle>
          <CardDescription>
            {completed
              ? `Cleanup completed! Redirecting in ${countdown}...`
              : "Cleaning up session data and cookies..."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-64 overflow-auto rounded-md bg-slate-950 p-4 text-sm text-slate-200">
              {status.length === 0 ? (
                <p className="text-slate-400">Waiting to start cleanup...</p>
              ) : (
                status.map((message, index) => (
                  <div key={index} className="py-1">
                    {message}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          {!completed && (
            <Button
              onClick={startCleanup}
              disabled={cleaning}
              variant={cleaning ? "outline" : "default"}
            >
              {cleaning ? "Cleaning..." : "Restart Cleanup"}
            </Button>
          )}

          <Button
            onClick={() => (window.location.href = "/auth/signin")}
            variant="outline"
          >
            {completed ? "Sign In Now" : "Cancel & Go to Sign In"}
          </Button>
        </CardFooter>
      </Card>

      {/* Nuclear option - helps when all else fails */}
      <div className="mt-8 text-center">
        <p className="mb-4 text-sm text-slate-500">
          Still having issues? Try the nuclear option:
        </p>
        <Button
          onClick={() => {
            fetch("/api/v1/auth/nuke-sessions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            })
              .then((response) => {
                if (response.ok) {
                  addStatus("✅ Server sessions nuked successfully!");
                  startCleanup();
                } else {
                  throw new Error("Failed to nuke sessions");
                }
              })
              .catch((error) => {
                addStatus(`❌ Error nuking sessions: ${error.message}`);
              });
          }}
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
        >
          Nuclear Option (Delete All Sessions)
        </Button>
      </div>
    </div>
  );
}
