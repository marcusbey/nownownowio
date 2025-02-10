"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

interface ProvidersProps extends PropsWithChildren {
  session: any; // Using any for session type as it comes from auth()
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="rounded-lg bg-red-50 p-8 text-red-800">
        <h2 className="mb-4 text-lg font-semibold">Something went wrong:</h2>
        <pre className="text-sm">{error.message}</pre>
      </div>
    </div>
  );
}

export function Providers({ children, session }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <SessionProvider session={session}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
}
