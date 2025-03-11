import { useQuery } from "@tanstack/react-query";

import type { BillingCycle } from "@/features/billing/plans/plans";

type OrganizationPlanType = 'FREE' | 'PREMIUM' | 'ENTERPRISE';

type OrganizationResponse = {
  organization: {
    id: string;
    slug: string;
    name: string;
    plan: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
      type: OrganizationPlanType;
      billingCycle: BillingCycle;
      maximumMembers: number;
      maximumPosts: number;
      maximumStorage: number;
      maxPostsPerDay: number;
      maxCommentsPerDay: number;
      maxLikesPerDay: number;
      maxMediaPerPost: number;
      canSchedulePosts: boolean;
      canPinPosts: boolean;
      hasCustomDomain: boolean;
      hasPrivateOrgs: boolean;
      hasAnalytics: boolean;
    } | null;
    email: string | null;
    image: string | null;
    websiteUrl: string | null;
    stripeCustomerId: string | null;
    roles: string[];
  };
}

/**
 * Fetch organization data by slug using the API
 * @param orgSlug Organization slug
 * @returns Promise with organization data
 */
async function getOrg(orgSlug: string) {
  if (!orgSlug) return null;
  
  try {
    // Use the new by-slug API endpoint to avoid route parameter naming conflicts
    const response = await fetch(`/api/v1/organizations/by-slug/${orgSlug}`);
    
    if (!response.ok) {
      // If the request fails, log the status code but don't show in production
      if (process.env.NODE_ENV !== 'production') {
        // Using a conditional check to avoid lint warnings about console statements
        const message = `Failed to fetch organization: ${response.status}`;
        // eslint-disable-next-line no-console
        console.warn(message);
      }
      return null;
    }
    
    const data = await response.json() as OrganizationResponse;
    return data.organization;
  } catch (error) {
    // Error occurred while fetching organization data
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error fetching organization:', error);
    }
    return null;
  }
}

/**
 * Hook to fetch organization data
 * @param orgSlug Organization slug
 * @returns Organization data and loading state
 */
export function useOrganization(orgSlug: string) {
  const { data: organization, isLoading } = useQuery({
    queryKey: ["organization", orgSlug],
    queryFn: async () => getOrg(orgSlug),
  });

  return {
    organization,
    isLoading,
  };
}
