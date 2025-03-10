import { redirect } from "next/navigation";
import { prisma } from "../prisma";
import { auth } from "./helper";

/**
 * Handles redirection based on user authentication and organization status.
 *
 * - If the user is authenticated and has an organization, redirect to `/orgs/{slug}`.
 * - If the user is authenticated but has no organization, redirect to `/orgs/new`.
 * - If the user is not authenticated, do not redirect.
 *
 * @returns A Next.js redirect response or null.
 */
import { logger } from '@/lib/logger';

export async function handleAuthRedirect() {
    const user = await auth();

    if (!user) {
        logger.debug('[Auth] No user found, skipping redirect');
        return null;
    }

    try {
        // First check if user exists in the database
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { id: true }
        });

        if (!dbUser) {
            logger.error('[Auth] User not found in database', { userId: user.id });
            return null;
        }

        // Check if user has any organization memberships
        const memberships = await prisma.organizationMembership.findMany({
            where: { userId: user.id },
            include: {
                organization: {
                    select: {
                        id: true,
                        slug: true,
                        name: true
                    },
                },
            },
            take: 1 // Only get the first membership
        });

        logger.debug('[Auth] Found user memberships', { 
            userId: user.id,
            membershipCount: memberships.length 
        });

        if (memberships.length > 0 && memberships[0].organization) {
            const org = memberships[0].organization;
            logger.debug('[Auth] Redirecting to organization', { 
                userId: user.id,
                orgSlug: org.slug,
                orgName: org.name
            });
            redirect(`/orgs/${org.slug}`);
            return null;
        }

        // User has no organizations, redirect to create new
        logger.debug('[Auth] User has no organizations, redirecting to create new', { 
            userId: user.id 
        });
        redirect('/orgs/new');
        return null;

    } catch (error) {
        logger.error('[Auth] Error in handleAuthRedirect', { 
            error,
            userId: user.id 
        });
        // On error, redirect to orgs list as fallback
        redirect('/orgs');
        return null;
    }
}