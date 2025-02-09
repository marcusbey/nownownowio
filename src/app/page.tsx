import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

interface HomePageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const session = await auth();

  // Debug session state
  logger.info('[HomePage] Session details', {
    hasSession: !!session,
    sessionKeys: session ? Object.keys(session) : [],
    hasUser: !!session?.user,
    userKeys: session?.user ? Object.keys(session.user) : [],
    userId: session?.user?.id,
    userEmail: session?.user?.email
  });

  // If user is not authenticated, redirect to sign in
  if (!session?.user) {
    logger.warn('[HomePage] No authenticated user found');
    return redirect("/auth/signin?error=Unauthenticated");
  }

  try {
    // Check if user has a primary organization
    const primaryOrg = await prisma.organizationMembership.findFirst({
      where: {
        userId: session.user.id,
        roles: { has: 'OWNER' }
      },
      include: {
        organization: {
          select: {
            slug: true,
            name: true
          }
        }
      }
    });

    // If user has a primary organization, redirect to their feed
    if (primaryOrg?.organization.slug) {
      logger.info('[HomePage] Redirecting to organization feed', { 
        orgSlug: primaryOrg.organization.slug,
        orgName: primaryOrg.organization.name
      });
      return redirect(`/orgs/${primaryOrg.organization.slug}/for-you`);
    }

    // Otherwise, redirect to organizations page
    logger.info('[HomePage] No primary organization found, redirecting to orgs page');
    return redirect("/orgs");
  } catch (error) {
    logger.error('[HomePage] Error checking organization membership', { 
      error,
      userId: session.user.id 
    });
    return redirect("/auth/error?error=DatabaseError");
  }
}
