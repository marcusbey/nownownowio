// To avoid calling many time same function, you can cache them with react `cache` method

import type { OrganizationMembershipRole } from "@prisma/client";
import { headers } from "next/headers";
import NodeCache from 'node-cache';
import { cache } from "react";
import { auth } from "../auth/helper";
import { prisma } from "../prisma";

/**
 * Determines if an organization has access to feedback features based on plan type
 * @param planType The organization's plan type
 * @returns boolean indicating if feedback features are available
 */
function hasFeedbackFeature(planType?: string): boolean {
    if (!planType) return false;

    // Only BASIC and PRO plans have feedback features
    return planType === 'BASIC' || planType === 'PRO';
}

// Node-based cache for server-side caching
const nodeCache = new NodeCache({ stdTTL: 300 }); // Cache for 5 minutes

/**
 * Generic caching function for server-side data
 * @param key Cache key
 * @param fetchData Function to fetch data if not in cache
 * @returns Cached or freshly fetched data
 */
export async function getCachedData<T>(key: string, fetchData: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        const cachedData = nodeCache.get<T>(key);
        if (cachedData) {
            resolve(cachedData);
        } else {
            fetchData()
                .then((data) => {
                    nodeCache.set(key, data);
                    resolve(data);
                })
                .catch(reject);
        }
    });
}

// Helper function to get org slug from URL
const getOrgSlugFromUrl = async (): Promise<string | undefined> => {
    const headerList = await headers();
    const xURL = headerList.get("x-url");

    if (!xURL) {
        return undefined;
    }

    // get the parameters after /orgs/ or /organizations/ and before a / or ? (if there are params)
    const match = xURL.match(/\/(?:orgs|organizations)\/([^/?]+)(?:[/?]|$)/);

    if (!match) {
        return undefined;
    }

    const organizationSlug = match[1];

    if (!organizationSlug) {
        return undefined;
    }

    return organizationSlug;
};

/**
 * Gets the current organization with caching
 */
export const getCurrentOrgCache = cache(async (orgSlug?: string | null) => {
    if (!orgSlug) {
        // Try to get from URL if not provided
        orgSlug = await getOrgSlugFromUrl();
        if (!orgSlug) return null;
    }

    try {
        const session = await auth();
        if (!session?.id) return null;

        // Validate orgSlug to prevent unexpected errors
        if (!orgSlug || typeof orgSlug !== 'string' || orgSlug.trim() === '') {
            if (process.env.NODE_ENV !== 'production') {
                console.error('Invalid organization slug');
            }
            return null;
        }

        const org = await prisma.organization.findFirst({
            where: {
                slug: orgSlug,
                members: {
                    some: {
                        userId: session.id,
                    },
                },
            },
            select: {
                id: true,
                name: true,
                slug: true,
                email: true,
                image: true,
                bannerImage: true,
                bio: true,
                websiteUrl: true,
                stripeCustomerId: true,
                planChangedAt: true,
                plan: true,
                members: {
                    where: {
                        userId: session.id,
                    },
                    select: {
                        roles: true,
                    },
                },
            },
        });

        return org;
    } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
            console.error("Error in getCurrentOrgCache:", error);
        }
        return null;
    }
});

/**
 * Gets the current organization with caching and required roles
 */
export const getRequiredCurrentOrgCache = cache(
    async (orgSlug: string, roles?: OrganizationMembershipRole[]) => {
        try {
            // Get the current organization
            const session = await auth();
            if (!session) {
                throw new Error("User not authenticated");
            }

            const org = await getRequiredCurrentOrg(orgSlug, roles);

            // Ensure org and members array exists and has items before accessing
            if (!org.members || org.members.length === 0) {
                throw new Error("No membership information found for this organization");
            }

            return {
                org,
                user: session,
                roles: org.members[0].roles
            };
        } catch (error) {
            if (process.env.NODE_ENV !== 'production') {
                console.error(`Error accessing organization ${orgSlug}:`, error);
            }
            // Re-throw the error to be handled by the calling component
            throw error;
        }
    }
);

/**
 * Organization with membership information type
 */
type OrganizationWithMembers = {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    image: string | null;
    bannerImage: string | null;
    bio: string | null;
    websiteUrl: string | null;
    stripeCustomerId: string | null;
    plan: {
        id: string;
        name: string;
        type: string;
    } | null;
    members: {
        roles: OrganizationMembershipRole[];
    }[];
    // Other optional fields
    createdAt?: Date;
    updatedAt?: Date;
    planId?: string;
    previousPlanId?: string | null;
    planChangedAt?: Date | null;

    // Virtual property - computed based on plan type
    hasFeedbackFeature?: boolean;
};

/**
 * Gets the current organization with required roles
 */
async function getRequiredCurrentOrg(orgSlug: string, roles?: OrganizationMembershipRole[]): Promise<OrganizationWithMembers> {
    const session = await auth();

    if (!session?.id) {
        throw new Error("User not authenticated");
    }

    // Validate orgSlug to prevent unexpected errors
    if (!orgSlug) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Missing organization slug');
        }
        throw new Error("Missing organization slug");
    }

    if (typeof orgSlug !== 'string') {
        if (process.env.NODE_ENV !== 'production') {
            console.error(`Invalid organization slug type: ${typeof orgSlug}`);
        }
        throw new Error("Invalid organization slug format");
    }

    if (orgSlug.trim() === '') {
        if (process.env.NODE_ENV !== 'production') {
            console.error('Empty organization slug');
        }
        throw new Error("Invalid organization slug");
    }

    // Find the organization by slug
    const org = await prisma.organization.findFirst({
        where: {
            slug: orgSlug,
            members: {
                some: {
                    userId: session.id,
                    ...(roles?.length ? { roles: { hasSome: roles } } : {}),
                },
            },
        },
        select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            image: true,
            bannerImage: true,
            bio: true,
            websiteUrl: true,
            stripeCustomerId: true,
            planId: true,
            previousPlanId: true,
            planChangedAt: true,
            plan: {
                select: {
                    id: true,
                    name: true,
                    type: true,
                }
            },
            members: {
                where: {
                    userId: session.id,
                },
                select: {
                    roles: true,
                },
            },
        },
    });

    if (!org) {
        try {
            // Validate the orgSlug format first
            if (!orgSlug || typeof orgSlug !== 'string' || orgSlug.trim() === '') {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(`Invalid organization slug format: '${orgSlug}'`);
                }
                throw new Error(`Invalid organization slug format`);
            }

            // Check if the organization exists but user doesn't have access
            const orgExists = await prisma.organization.findUnique({
                where: { slug: orgSlug },
                select: { id: true, name: true }
            });

            if (orgExists) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(`User ${session.id} doesn't have access to organization ${orgSlug} (${orgExists.name})`);
                }
                throw new Error(`You don't have access to this organization`);
            } else {
                // Log detailed error for debugging but provide a more generic user-facing message
                if (process.env.NODE_ENV !== 'production') {
                    console.error(`Organization with slug '${orgSlug}' not found in database`);
                }

                // Check if this might be a typo or case sensitivity issue
                const similarOrgs = await prisma.organization.findMany({
                    where: {
                        slug: {
                            contains: orgSlug.split('-')[0], // Try to match on first part of slug
                            mode: 'insensitive'
                        }
                    },
                    take: 3,
                    select: { slug: true, name: true }
                });

                if (similarOrgs.length > 0 && process.env.NODE_ENV !== 'production') {
                    console.info(`Found similar organizations: ${JSON.stringify(similarOrgs)}`);
                }

                throw new Error(`Organization not found. Please check the URL and try again.`);
            }
        } catch (error) {
            // Check if this is already an enhanced error to prevent recursive wrapping
            if (error instanceof Error && error.message.includes('Error accessing organization')) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(error);
                }
                throw error;
            }

            // Add context to the error but keep the message clean
            if (process.env.NODE_ENV !== 'production') {
                console.error(`Error accessing organization ${orgSlug}:`, error);
            }
            throw new Error('Organization not found. Please check the URL or contact support if the issue persists.');
        }
    }

    // Add virtual property for feedback feature access
    if (org) {
        const orgWithFeedback = org as OrganizationWithMembers;
        orgWithFeedback.hasFeedbackFeature = hasFeedbackFeature(org.plan.type);
    }

    return org;
}
