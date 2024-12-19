import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";
import { NavigationWrapper } from "@/features/navigation/NavigationWrapper";
import { getServerUrl } from "@/lib/server-url";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/helper";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { z } from "zod";
import { Page400 } from "@/features/page/Page400";
import { combineWithParentMetadata } from "@/lib/metadata";
import { InvitationForm } from "./InvitationForm";

const TokenSchema = z.object({
  orgId: z.string(),
  email: z.string(),
});

export const generateMetadata = combineWithParentMetadata({
  title: "Invitation",
  description: "You receive an invitation to join an organization.",
});

export default async function RoutePage(
  props: PageParams<{ orgSlug: string; token: string }>,
) {
  const organization = await prisma.organization.findFirst({
    where: {
      slug: props.params.orgSlug,
    },
  });

  if (!organization) {
    return <Page400 title="Invalid token 1" />;
  }

  const verificationToken = await prisma.verificationToken.findUnique({
    where: {
      token: props.params.token,
    },
  });

  if (!verificationToken) {
    return <Page400 title="Invalid token 2" />;
  }

  const session = await auth();
  const user = session?.user;

  const tokenData = TokenSchema.parse(verificationToken.data);

  if (tokenData.orgId !== organization.id) {
    return <Page400 title="Invalid token 3" />;
  }

  if (!user) {
    return (
      <NavigationWrapper>
        <Layout>
          <LayoutHeader>
            <LayoutTitle>
              Welcome to {organization.name}
            </LayoutTitle>
          </LayoutHeader>
          <LayoutContent>
            <InvitationForm 
              organization={organization}
              tokenData={tokenData}
              token={props.params.token}
            />
          </LayoutContent>
        </Layout>
      </NavigationWrapper>
    );
  }

  // If user is logged in but with a different email
  if (user && user.email !== tokenData.email) {
    return (
      <NavigationWrapper>
        <Layout>
          <LayoutHeader>
            <LayoutTitle>
              Wrong Account
            </LayoutTitle>
          </LayoutHeader>
          <LayoutContent>
            <Card>
              <CardHeader>
                <CardTitle>Please sign in with the correct email</CardTitle>
                <CardDescription>
                  This invitation was sent to {tokenData.email}, but you're signed in as {user.email}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Link
                    className={buttonVariants({ size: "lg", className: "w-full" })}
                    href={`/auth/signin?callbackUrl=${encodeURIComponent(`${getServerUrl()}/orgs/${organization.slug}/invitations/${props.params.token}`)}&email=${encodeURIComponent(tokenData.email)}`}
                  >
                    Sign in as {tokenData.email}
                  </Link>
                </div>
              </CardContent>
            </Card>
          </LayoutContent>
        </Layout>
      </NavigationWrapper>
    );
  }

  // If user is logged in with the correct email, add them to the organization
  if (user && user.email === tokenData.email) {
    // Check if they're already a member
    const existingMembership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId: organization.id,
        userId: user.id,
      },
    });

    if (existingMembership) {
      return (
        <NavigationWrapper>
          <Layout>
            <LayoutHeader>
              <LayoutTitle>
                Already a Member
              </LayoutTitle>
            </LayoutHeader>
            <LayoutContent>
              <Card>
                <CardHeader>
                  <CardTitle>You're already a member of {organization.name}</CardTitle>
                  <CardDescription>
                    You can access the organization now
                  </CardDescription>
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

    // Add them to the organization
    await prisma.organizationMembership.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        roles: ["MEMBER"],
      },
    });

    // Delete the invitation token
    await prisma.verificationToken.delete({
      where: {
        token: props.params.token,
      },
    });

    // Redirect to the organization
    redirect(`/orgs/${organization.slug}`);
  }

  return null;
}
