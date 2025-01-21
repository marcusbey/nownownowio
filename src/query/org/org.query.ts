import { useQuery } from '@tanstack/react-query';

interface Organization {
  id: string;
  name: string;
  slug: string;
  plan?: {
    id: string;
    name: string;
  };
}

async function fetchOrganization(orgSlug: string): Promise<Organization> {
  const response = await fetch(`/api/org/${orgSlug}/by-id`);
  if (!response.ok) {
    throw new Error('Failed to fetch organization');
  }
  return response.json();
}

export function useOrganization(orgSlug: string) {
  const { data: organization, isLoading, error } = useQuery({
    queryKey: ['organization', orgSlug],
    queryFn: () => fetchOrganization(orgSlug),
    enabled: !!orgSlug,
  });

  return {
    organization,
    isLoading,
    error,
  };
}
