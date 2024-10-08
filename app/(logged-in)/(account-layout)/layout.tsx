import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { BaseLayout } from "@/features/layout/BaseLayout";
import { Layout } from "@/features/page/layout";
import { auth } from "@/lib/auth/helper";
import { logger } from "@/lib/logger";
import type { LayoutParams } from "@/types/next";
import { CircleAlert, Rabbit } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { AccountNavigation } from "./AccountNavigation";
import { VerifyEmailButton } from "./account/verify-email/VerifyEmailButton";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account settings.",
};

export const dynamic = "force-dynamic";

export default async function RouteLayout(props: LayoutParams) {
  try {
    const user = await auth();

    if (!user) {
      logger.warn("No user found in RouteLayout");
      return (
        <BaseLayout>
          <Layout>
            <Alert>
              <Rabbit className="size-4" />
              <div>
                <Typography variant="large">
                  It looks like you are not logged in. Please sign in to access
                  your account settings.
                </Typography>
                <Link
                  href="/auth/signin"
                  className={buttonVariants({
                    className: "mt-2",
                  })}
                >
                  Sign in
                </Link>
              </div>
            </Alert>
          </Layout>
        </BaseLayout>
      );
    }

    return (
      <div>
        {!user?.emailVerified ? (
          <div className="flex items-center gap-4 bg-primary px-4 py-1">
            <CircleAlert size={16} />
            <Typography variant="small">
              Email not verified. Please verify your email.
            </Typography>
            <VerifyEmailButton
              variant="invert"
              className="ml-auto flex h-6 w-fit items-center gap-1 rounded-md px-3 text-sm"
            />
          </div>
        ) : null}
        <AccountNavigation>{props.children}</AccountNavigation>
      </div>
    );
  } catch (error) {
    logger.error("Error in RouteLayout:", error);
    return <div>An error occurred. Please try again later.</div>;
  }
}
