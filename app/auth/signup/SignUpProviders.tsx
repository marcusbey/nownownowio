"use client";

import { ProviderButton } from "@/components/composite/auth/ProviderButton";
import { Alert, AlertTitle } from "@/components/feedback/alert";
import { Divider } from "@/components/layout/divider";
import { Skeleton } from "@/components/feedback/skeleton";
import { Typography } from "@/components/data-display/typography";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import React from "react";

export const SignUpProviders = () => {
  const {
    data: providers,
    isPending,
    error,
  } = useQuery({
    queryFn: async () => fetch(`/api/v1/auth/providers`).then(async (res) => res.json()),
    queryKey: ["providers"],
  });

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-9" />
        <Divider>or</Divider>
        <Skeleton className="h-11" />
      </div>
    );
  }

  if (error) return <div>Error loading providers</div>;

  if (typeof providers !== "object") {
    return (
      <Alert>
        <AlertTriangle size={16} />
        <AlertTitle>
          The provider is not available. It's due to a misconfiguration in the
          <Typography variant="code">auth.ts</Typography> file.
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <div className="flex min-w-96 flex-col items-center gap-4">
      {providers.credentials ? (
        <>
          <div className="flex w-full flex-col gap-3">
            {providers.google ? (
              <ProviderButton providerId="google" action="signup" />
            ) : null}
            {providers.twitter ? (
              <ProviderButton providerId="twitter" action="signup" />
            ) : null}
            {providers.github ? (
              <ProviderButton providerId="github" action="signup" />
            ) : null}
          </div>
          <div className="my-2 flex w-full items-center justify-center">
            <div className="rounded bg-slate-700 px-4 py-1 text-sm text-white">
              or
            </div>
          </div>
        </>
      ) : null}
      <Link href="/auth/signup" className="w-full">
        <button 
          type="submit" 
          className="block w-full rounded-md bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
        >
          Create account
        </button>
      </Link>

      {providers.credentials ? (
        <div className="mt-4 flex justify-center text-sm">
          <span className="text-slate-300">Already have an account?</span>
          <Link href="/auth/signin" className="ml-2 text-amber-400 hover:text-amber-300">
            Sign in
          </Link>
        </div>
      ) : null}
    </div>
  );
};
