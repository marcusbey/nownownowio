// To avoid calling many time same function, you can cache them with react `cache` method

import type { OrganizationMembershipRole } from "@prisma/client";
import { headers } from "next/headers";
import NodeCache from 'node-cache';
import { cache } from "react";
import { auth } from "../auth/helper";
import { prisma } from "../prisma";

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
const getOrgSlugFromUrl = async () => {
    const headerList = await headers();
    const xURL = headerList.get("x-url");

    if (!xURL) {
        return null;
    }

    // get the parameters after /orgs/ or /organizations/ and before a / or ? (if there are params)
    const match = xURL.match(/\/(?:orgs|organizations)\/([^/?]+)(?:[/?]|$)/);

    if (!match) {
        return null;
    }

    const organizationSlug = match[1];

    if (!organizationSlug) {
        return null;
    }

    return organizationSlug;
};

/**
 * Gets the current organization with caching
 */
export const getCurrentOrgCache = cache(async (orgSlug?: string) => {
    if (!orgSlug) {
        // Try to get from URL if not provided
        orgSlug = await getOrgSlugFromUrl();
        if (!orgSlug) return null;
    }

    try {
        const session = await auth();
        if (!session?.id) return null;

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
                websiteUrl: true,
                stripeCustomerId: true,
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
        console.error("Error in getCurrentOrgCache:", error);
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
            const org = await getRequiredCurrentOrg(orgSlug, roles);
            return {
                org,
                user: session,
                roles: org.members[0].roles
            };
        } catch (error) {
            console.error(`Error accessing organization ${orgSlug}:`, error);
            // Re-throw the error to be handled by the calling component
            throw error;
        }
    }
);

/**
 * Gets the current organization with required roles
 */
async function getRequiredCurrentOrg(orgSlug: string, roles?: OrganizationMembershipRole[]) {
    const session = await auth();

    if (!session?.id) {
        throw new Error("User not authenticated");
    }
    
    // Validate orgSlug to prevent unexpected errors
    if (!orgSlug) {
        console.error('Missing organization slug');
        throw new Error("Missing organization slug");
    }
    
    if (typeof orgSlug !== 'string') {
        console.error(`Invalid organization slug type: ${typeof orgSlug}`);
        throw new Error("Invalid organization slug format");
    }
    
    if (orgSlug.trim() === '') {
        console.error('Empty organization slug');
        throw new Error("Invalid organization slug");
    }

    // Find the organization by slug
    const org = await prisma.organization.findFirst({
        where: {
            slug: orgSlug,
            members: {
                some: {
                    userId: session.id,
                    ...(roles && roles.length > 0 ? { roles: { hasSome: roles } } : {}),
                },
            },
        },
        select: {
            id: true,
            name: true,
            slug: true,
            email: true,
            image: true,
            bio: true,
            websiteUrl: true,
            stripeCustomerId: true,
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

    if (!org) {
        try {
            // Validate the orgSlug format first
            if (!orgSlug || typeof orgSlug !== 'string' || orgSlug.trim() === '') {
                console.error(`Invalid organization slug format: '${orgSlug}'`);
                throw new Error(`Invalid organization slug format`);
            }

            // Check if the organization exists but user doesn't have access
            const orgExists = await prisma.organization.findUnique({
                where: { slug: orgSlug },
                select: { id: true, name: true }
            });
            
            if (orgExists) {
                console.error(`User ${session.id} doesn't have access to organization ${orgSlug} (${orgExists.name})`);
                throw new Error(`You don't have access to this organization`);
            } else {
                // Log detailed error for debugging but provide a more generic user-facing message
                console.error(`Organization with slug '${orgSlug}' not found in database`);
                
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
                
                if (similarOrgs.length > 0) {
                    console.info(`Found similar organizations: ${JSON.stringify(similarOrgs)}`);
                }
                
                throw new Error(`Organization not found. Please check the URL and try again.`);
            }
        } catch (error) {
            // Check if this is already an enhanced error to prevent recursive wrapping
            if (error instanceof Error && error.message.includes('Error accessing organization')) {
                console.error(error);
                throw error;
            }
            
            // Add context to the error but keep the message clean
            console.error(`Error accessing organization ${orgSlug}:`, error);
            throw new Error('Organization not found. Please check the URL or contact support if the issue persists.');
        }
    }

    return org;
}
