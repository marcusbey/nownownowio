"use client";

import { Toaster } from "@/components/ui/sonner";
import { AlertDialogRenderer } from "@/features/alert-dialog/AlertDialogRenderer";
import { GlobalDialogLazy } from "@/features/global-dialog/GlobalDialogLazy";
import { SearchParamsMessageToastSuspended } from "@/features/searchparams-message/SearchParamsMessageToast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import dynamic from 'next/dynamic';
import type { PropsWithChildren } from "react";
import { Suspense, useState } from "react";

const ThemeProvider = dynamic(
  () => import('next-themes').then(mod => mod.ThemeProvider),
  { ssr: false }
);

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // Data stays fresh for 5 minutes
        cacheTime: 30 * 60 * 1000, // Cache persists for 30 minutes
        refetchOnWindowFocus: false,
        suspense: true,
        retry: 1,
        networkMode: 'offlineFirst',
        refetchOnReconnect: 'always',
      },
    },
  });
}

const NonCriticalComponents = () => (
  <Suspense fallback={null}>
    <AlertDialogRenderer />
    <GlobalDialogLazy />
    <SearchParamsMessageToastSuspended />
  </Suspense>
);

export const Providers = ({ children }: PropsWithChildren) => {
  // Create a new QueryClient instance for each session to prevent shared cache between users
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
          {children}
          <NonCriticalComponents />
        </QueryClientProvider>
      </SessionProvider>
    </ThemeProvider>
  );
};
