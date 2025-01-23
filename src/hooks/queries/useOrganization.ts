import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Organization, User } from '@prisma/client';
import { getUsersOrgs } from '@/query/org/get-users-orgs.query';

// Query keys for organization-related queries
export const orgKeys = {
  all: ['organizations'] as const,
  lists: () => [...orgKeys.all, 'list'] as const,
  detail: (slug: string) => [...orgKeys.all, 'detail', slug] as const,
};

// Types
export interface OrganizationWithRoles extends Organization {
  members: {
    roles: string[];
  }[];
}

// Hook for fetching user's organizations
export function useUserOrganizations() {
  return useQuery({
    queryKey: orgKeys.lists(),
    queryFn: getUsersOrgs,
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
  });
}

// Hook for updating organization
export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orgId, data }: { orgId: string; data: Partial<Organization> }) => {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update organization');
      return response.json();
    },
    onMutate: async ({ orgId, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: orgKeys.detail(orgId) });

      // Snapshot the previous value
      const previousOrg = queryClient.getQueryData<Organization>(orgKeys.detail(orgId));

      // Optimistically update
      queryClient.setQueryData<Organization>(orgKeys.detail(orgId), (old) => ({
        ...old!,
        ...data,
      }));

      return { previousOrg };
    },
    onError: (err, { orgId }, context) => {
      // Rollback on error
      if (context?.previousOrg) {
        queryClient.setQueryData(orgKeys.detail(orgId), context.previousOrg);
      }
    },
    onSettled: (_, __, { orgId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: orgKeys.detail(orgId) });
      queryClient.invalidateQueries({ queryKey: orgKeys.lists() });
    },
  });
}
