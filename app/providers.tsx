"use client";

import { Toaster } from "@/components/feedback/sonner";
import { AlertDialogRenderer } from "@/features/ui/alert-dialog/alert-dialog-renderer";
import { GlobalDialogLazy } from "@/features/ui/global-dialog/global-dialog-lazy";
import { SearchParamsMessageToastSuspended } from "@/features/ui/global-dialog/search-params-message-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { PropsWithChildren } from "react";

const queryClient = new QueryClient();

export const Providers = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SessionProvider>
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
