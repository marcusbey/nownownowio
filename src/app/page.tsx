import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  try {
    const session = await auth();

    // If user is not authenticated, redirect to sign in
    if (!session?.user) {
      redirect("/auth/signin");
    }

    // Check if user has a primary organization
    const primaryOrg = await prisma.organizationMembership.findFirst({
      where: {
        userId: session.user.id,
        roles: { has: 'OWNER' }
      },
      include: {
        organization: true
      }
    });

    // If user has a primary organization, redirect to their feed
    if (primaryOrg?.organization.slug) {
      redirect(`/orgs/${primaryOrg.organization.slug}/for-you`);
    }

    // Otherwise, redirect to organizations page
    redirect("/orgs");
  } catch (error) {
    logger.error('[HomePage] Error in root page', { error });
    redirect("/auth/error");
  }
}
