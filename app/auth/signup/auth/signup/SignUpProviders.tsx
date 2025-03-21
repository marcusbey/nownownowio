"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { ProviderButton } from "@/src/components/composite/auth/ProviderButton";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const SignUpProviders = () => {
  const {
    data: providers,
    isPending,
    error,
  } = useQuery({
    queryFn: async () =>
      fetch(`/api/auth/providers`).then(async (res) => res.json()),
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
        <AlertDescription>
          Please go to{" "}
          <Typography variant="link" as={Link} href="">
            the Now.TS documentation
          </Typography>{" "}
          to resolve the issue.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex min-w-96 flex-col gap-8">
      {providers.credentials ? (
        <>
          <div className="flex flex-col gap-2">
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
          <Divider>or</Divider>
        </>
      ) : null}
      <Link href="/auth/signup">
        <button type="submit" className="w-full">
          Create account
        </button>
      </Link>

      {providers.credentials ? (
        <Typography variant="small" className="flex justify-center">
          Already have an account?{" "}
          <Typography
            variant="link"
            as={Link}
            href="/auth/signin"
            className="pl-2"
          >
            Sign in
          </Typography>
        </Typography>
      ) : null}
    </div>
  );
};
