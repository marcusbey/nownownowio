import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { NavigationWrapper } from "@/features/navigation/NavigationWrapper";
import { Layout } from "@/features/page/layout";
import { auth } from "@/lib/auth/helper";
import { getCurrentOrgCache } from "@/lib/react/cache";
import type { LayoutParams } from "@/types/next";
import { Rabbit } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { OrgNavigation } from "./_navigation/OrgNavigation";

async function loadData(orgSlug: string) {
  const [org, user] = await Promise.all([
    getCurrentOrgCache(orgSlug),
    auth()
  ]);
  return { org, user };
}

export default async function RouteLayout(
  props: LayoutParams<{ orgSlug: string }>,
) {
  const { org, user } = await loadData(props.params.orgSlug);

  if (!org) {
    return (
      <NavigationWrapper>
        <Layout>
          <Alert>
            <Rabbit className="size-4" />
            <div>
              <Typography variant="large">
                Oh! You are not logged in or the organization with the ID{" "}
                <Typography variant="code">{props.params.orgSlug}</Typography>{" "}
                was not found.
              </Typography>
              {user ? (
                <Link
                  href="/orgs"
                  className={buttonVariants({
                    className: "mt-2",
                  })}
                >
                  Return to your organizations
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className={buttonVariants({
                    className: "mt-2",
                  })}
                >
                  Sign in
                </Link>
              )}
            </div>
          </Alert>
        </Layout>
      </NavigationWrapper>
    );
  }

  return (
    <Suspense fallback={
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse">Loading organization...</div>
      </div>
    }>
      <OrgNavigation>{props.children}</OrgNavigation>
    </Suspense>
  );
}
