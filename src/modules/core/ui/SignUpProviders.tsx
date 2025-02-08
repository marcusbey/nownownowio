"use client";

import { ProviderButton } from "@/components/auth/ProviderButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";
import { Typography } from "@/components/ui/typography";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

export const SignUpProviders = () => {
  const {
    data: providers,
    isPending,
    error,
  } = useQuery({
    queryFn: () => fetch(`/api/auth/providers`).then((res) => res.json()),
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
    <div className="flex w-full flex-col gap-4">
      {providers.credentials && (
        <div className="space-y-3">
          <div className="flex flex-col gap-2">
            {providers.google && (
              <ProviderButton
                providerId="google"
                action="signup"
                className="h-10 text-sm"
              />
            )}
            {providers.twitter && (
              <ProviderButton
                providerId="twitter"
                action="signup"
                className="h-10 text-sm"
              />
            )}
            {providers.github && (
              <ProviderButton
                providerId="github"
                action="signup"
                className="h-10 text-sm"
              />
            )}
          </div>
          <div className="relative">
            <Divider>
              <span className="px-2 text-xs text-muted-foreground">or</span>
            </Divider>
          </div>
        </div>
      )}

      <Button
        asChild
        variant="default"
        className="h-10 w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-sm text-white hover:from-blue-700 hover:to-indigo-700"
      >
        <Link href="/auth/signup">Create account</Link>
      </Button>

      {providers.credentials && (
        <Typography variant="small" className="flex justify-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Typography
            variant="link"
            as={Link}
            href="/auth/signin"
            className="pl-2 font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Typography>
        </Typography>
      )}
    </div>
  );
};
