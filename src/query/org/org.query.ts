import { useQuery } from "@tanstack/react-query";
import { getCurrentOrg } from "@/lib/organizations/get-org";

export function useOrganization(orgSlug: string) {
  const { data: organization, isLoading } = useQuery({
    queryKey: ["organization", orgSlug],
    queryFn: () => getOrg(orgSlug),
  });

  return {
    organization,
    isLoading,
  };
}
