"use client";

import { Toaster } from "@/components/feedback/sonner";
import { PlanPricingProvider } from "@/features/billing/plans/plan-pricing-context";
import { AlertDialogRenderer } from "@/features/ui/alert-dialog/alert-dialog-renderer";
import { GlobalDialogLazy } from "@/features/ui/global-dialog/global-dialog-lazy";
import { SearchParamsMessageToastSuspended } from "@/features/ui/global-dialog/search-params-message-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";
import { useState } from "react";

export const Providers = ({ children }: PropsWithChildren) => {
  // Create a new QueryClient with optimized settings for each client session
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // --- ENHANCED CACHING SETTINGS ---
            // Increase staleTime: Data is considered fresh for 5 minutes
            staleTime: 5 * 60 * 1000,
            // Increase gcTime: Keep unused data for 15 minutes
            gcTime: 15 * 60 * 1000,
            // Keep retry at 1 to avoid excessive retries on transient errors
            retry: 1,
            // Keep refetchOnWindowFocus false unless specifically needed for a query
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  // Use client-side state to track if we're in development mode
  const [isDev] = useState(
    () =>
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1",
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider
        basePath="/api/v1/auth"
        refetchInterval={5 * 60} // Refetch session every 5 minutes
        refetchOnWindowFocus={true} // Refetch on window focus
      >
        <QueryClientProvider client={queryClient}>
          <Toaster />
          <AlertDialogRenderer />
          <GlobalDialogLazy />
          <SearchParamsMessageToastSuspended />
          <PlanPricingProvider>{children}</PlanPricingProvider>
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};
