import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useOrganization() {
    const params = useParams();
    const orgSlug = params.orgSlug as string;

    const { data: organization, ...rest } = useQuery({
        queryKey: ["organization", orgSlug],
        queryFn: async () => {
            const response = await kyInstance
                .get(ENDPOINTS.ORGANIZATION_BY_ID(orgSlug))
                .json<{
                    id: string;
                    name: string;
                    slug: string;
                    image: string | null;
                }>();
            return response;
        },
    });

    return {
        organization,
        ...rest,
    };
} 