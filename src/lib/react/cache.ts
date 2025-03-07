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
        // Get the current organization
        const session = await auth();
        const org = await getRequiredCurrentOrg(orgSlug, roles);
        return {
            org,
            user: session,
            roles: org.members[0].roles
        };
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
        throw new Error(`Organization not found or user doesn't have required access`);
    }

    return org;
}
