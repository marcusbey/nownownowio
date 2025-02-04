import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { BaseLayout } from "@/features/layout/BaseLayout";
import { Layout, LayoutContent } from "@/features/page/layout"; 
import { auth } from "@/lib/auth/helper";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type { LayoutParams } from "@/types/next";
import { CircleAlert, Rabbit } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountNavigation } from "./AccountNavigation";
import { VerifyEmailButton } from "./account/verify-email/VerifyEmailButton";

export const metadata: Metadata = {
  title: "Account",
  description: "Manage your account settings.",
};

export const dynamic = "force-dynamic";

export default async function RouteLayout(props: LayoutParams) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      redirect("/sign-in");
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      logger.warn("No user found in RouteLayout");
      return (
        <BaseLayout>
          <Layout>
            <LayoutContent>
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
            </LayoutContent>
          </Layout>
        </BaseLayout>
      );
    }

    return (
      <BaseLayout>
        <Layout>
          <LayoutContent>
            {!user.emailVerified ? (
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
          </LayoutContent>
        </Layout>
      </BaseLayout>
    );
  } catch (error) {
    logger.error("Error in RouteLayout:", error);
    throw error;
  }
}
