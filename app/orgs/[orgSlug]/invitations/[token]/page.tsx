import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth/helper";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { InvitationForm } from "./InvitationForm";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";
import { NavigationWrapper } from "@/features/navigation/NavigationWrapper";
import { getServerUrl } from "@/lib/server-url";
import Link from "next/link";
import { z } from "zod";
import { Page400 } from "@/features/page/Page400";
import { combineWithParentMetadata } from "@/lib/metadata";

const TokenSchema = z.object({
  orgId: z.string(),
  email: z.string(),
});

export const generateMetadata = combineWithParentMetadata({
  title: "Invitation",
  description: "You received an invitation to join an organization.",
});

export default async function InvitationPage({
  params: { orgSlug, token },
}: {
  params: { orgSlug: string; token: string };
}) {
  // Get the current session
  const session = await auth.getSession();

  // Find and validate the token
  const verificationToken = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verificationToken) {
    return <Page400 title="Invalid or expired invitation link" />;
  }

  if (verificationToken.expires < new Date()) {
    return (
      <NavigationWrapper>
        <Layout>
          <LayoutHeader>
            <LayoutTitle>Invitation Expired</LayoutTitle>
          </LayoutHeader>
          <LayoutContent>
            <Card>
              <CardHeader>
                <CardTitle>This invitation has expired</CardTitle>
                <CardDescription>
                  Please request a new invitation from the organization administrator.
                </CardDescription>
              </CardHeader>
            </Card>
          </LayoutContent>
        </Layout>
      </NavigationWrapper>
    );
  }

  const tokenData = TokenSchema.parse(verificationToken.data);

  // Get organization details
  const organization = await prisma.organization.findUnique({
    where: { id: tokenData.orgId },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  });

  if (!organization || organization.slug !== orgSlug) {
    return <Page400 title="Invalid organization" />;
  }

  // If user is logged in but with a different email
  if (session?.user && session.user.email !== tokenData.email) {
    return (
      <NavigationWrapper>
        <Layout>
          <LayoutHeader>
            <LayoutTitle>Wrong Account</LayoutTitle>
          </LayoutHeader>
          <LayoutContent>
            <Card>
              <CardHeader>
                <CardTitle>Please sign in with the correct email</CardTitle>
                <CardDescription>
                  This invitation was sent to {tokenData.email}, but you're signed in as {session.user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link
                  className={buttonVariants({ size: "lg", className: "w-full" })}
                  href={`/auth/signin?callbackUrl=${encodeURIComponent(
                    `${getServerUrl()}/orgs/${organization.slug}/invitations/${token}`,
                  )}&email=${encodeURIComponent(tokenData.email)}`}
                >
                  Sign in as {tokenData.email}
                </Link>
              </CardContent>
            </Card>
          </LayoutContent>
        </Layout>
      </NavigationWrapper>
    );
  }

  // Check if user is already a member
  if (session?.user?.email === tokenData.email) {
    const existingMembership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: organization.id,
        user: { email: session.user.email },
      },
    });

    if (existingMembership) {
      return (
        <NavigationWrapper>
          <Layout>
            <LayoutHeader>
              <LayoutTitle>Already a Member</LayoutTitle>
            </LayoutHeader>
            <LayoutContent>
              <Card>
                <CardHeader>
                  <CardTitle>You're already a member of {organization.name}</CardTitle>
                  <CardDescription>You can access the organization now</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link
                    className={buttonVariants({ size: "lg" })}
                    href={`/orgs/${organization.slug}`}
                  >
                    Go to {organization.name}
                  </Link>
                </CardContent>
              </Card>
            </LayoutContent>
          </Layout>
        </NavigationWrapper>
      );
    }
  }

  return (
    <NavigationWrapper>
      <Layout>
        <LayoutHeader>
          <LayoutTitle>Welcome to {organization.name}</LayoutTitle>
        </LayoutHeader>
        <LayoutContent>
          <InvitationForm 
            token={token}
            email={tokenData.email}
            organizationName={organization.name}
          />
        </LayoutContent>
      </Layout>
    </NavigationWrapper>
  );
}
