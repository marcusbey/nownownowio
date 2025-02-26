"use client";

import { Toaster } from "@/components/feedback/sonner";
import { AlertDialogRenderer } from "@/features/ui/alert-dialog/alert-dialog-renderer";
import { GlobalDialogLazy } from "@/features/ui/global-dialog/global-dialog-lazy";
import { SearchParamsMessageToastSuspended } from "@/features/ui/global-dialog/search-params-message-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { useState } from "react";

// Create a new QueryClient with optimized error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't retry on error by default
      retry: 0,
      // Don't refetch on window focus by default
      refetchOnWindowFocus: false,
      // Shorter stale time to reduce potential staleness
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export const Providers = ({ children }: PropsWithChildren) => {
  // Use client-side state to track if we're in development mode
  const [isDev] = useState(() => 
    process.env.NODE_ENV === 'development' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider
        basePath="/api/v1/auth"
        refetchInterval={30} // Check session every 30 seconds
        refetchOnWindowFocus={true} // Refetch on window focus to ensure up-to-date session
      >
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <AlertDialogRenderer />
          <GlobalDialogLazy />
          <SearchParamsMessageToastSuspended />
          {children}
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};
