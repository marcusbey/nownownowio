import { buttonVariants } from "@/components/core/button";
import { Typography } from "@/components/data-display/typography";
import { Alert } from "@/components/feedback/alert";
import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { Rabbit } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { OrgNavigation } from "./_navigation/org-navigation";

async function loadData(orgSlug: string) {
  try {
    const session = await auth();
    if (!session) {
      return { error: "Unauthorized" };
    }

    const org = await prisma.organization.findUnique({
      where: { slug: orgSlug },
      include: {
        members: {
          where: { userId: session.id },
          select: { roles: true },
        },
      },
    });

    if (!org) {
      return { error: "Not found" };
    }

    return { org, user: session };
  } catch (error) {
    console.error("[ORG_LAYOUT]", error);
    return { error: "Internal server error" };
  }
}

function LoadingFallback() {
  return <div className="flex min-h-screen animate-pulse bg-muted" />;
}

export default async function RouteLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { orgSlug: string };
}) {
  // Await params before using its properties
  const awaitedParams = await params;
  const orgSlug = awaitedParams.orgSlug;

  const { org, user, error } = await loadData(orgSlug);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <Alert>
            <Rabbit className="size-4" />
            <div>
              <Typography variant="large">
                {error === "Unauthorized"
                  ? "You must be logged in to access this page."
                  : error === "Not found"
                    ? "Organization not found."
                    : "An error occurred while loading the organization."}
              </Typography>
              {error === "Unauthorized" ? (
                <Link
                  href="/auth/signin"
                  className={buttonVariants({
                    className: "mt-2",
                  })}
                >
                  Sign in
                </Link>
              ) : (
                <Link
                  href="/orgs"
                  className={buttonVariants({
                    className: "mt-2",
                  })}
                >
                  Return to your organizations
                </Link>
              )}
            </div>
          </Alert>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<LoadingFallback />}>
        <OrgNavigation params={Promise.resolve({ orgSlug })}>{children}</OrgNavigation>
      </Suspense>
    </div>
  );
}
