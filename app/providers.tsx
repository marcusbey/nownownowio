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
            // Optimized cache settings
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes
            // Don't retry on error by default
            retry: 1,
            // Don't refetch on window focus by default
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
