import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout, LayoutContent, LayoutHeader, LayoutTitle } from "@/features/page/layout";
import { NavigationWrapper } from "@/features/navigation/NavigationWrapper";
import { SubmitButton } from "@/features/form/SubmitButton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { env } from "@/lib/env";
import { hashStringWithSalt, validatePassword } from "@/lib/auth/credentials-provider";
import { getServerUrl } from "@/lib/server-url";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/helper";
import type { PageParams } from "@/types/next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { Page400 } from "@/features/page/Page400";
import { combineWithParentMetadata } from "@/lib/metadata";

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
            <Card>
              <CardHeader>
                <CardTitle>Complete your profile</CardTitle>
                <CardDescription>
                  Set up your account to join {organization.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Your Name</Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Choose a Password</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        required
                      />
                      <p className="text-sm text-muted-foreground">
                        At least 8 characters with letters and numbers
                      </p>
                    </div>
                    <SubmitButton
                      className="w-full"
                      formAction={async (formData: FormData) => {
                        "use server";
                        
                        const name = formData.get("name") as string;
                        const password = formData.get("password") as string;
                        
                        if (!validatePassword(password)) {
                          throw new Error(
                            "Password must be at least 8 characters and contain letters and numbers"
                          );
                        }

                        // Create the user account
                        const user = await prisma.user.create({
                          data: {
                            email: tokenData.email,
                            name,
                            passwordHash: hashStringWithSalt(password, env.NEXTAUTH_SECRET),
                            emailVerified: new Date(), // Email is verified through invitation
                          },
                        });

                        // Create the organization membership
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

                        // Sign them in automatically using server-side auth
                        const response = await signIn("credentials", {
                          email: tokenData.email,
                          password,
                          redirect: false,
                          callbackUrl: `/orgs/${organization.slug}/settings`,
                        });

                        if (response?.error) {
                          throw new Error("Failed to sign in automatically");
                        }

                        // Redirect to organization settings
                        redirect(`/orgs/${organization.slug}/settings`);
                      }}
                    >
                      Create Account & Join {organization.name}
                    </SubmitButton>
                  </div>
                </form>
              </CardContent>
            </Card>
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
}
