import { orgMetadata } from "@/lib/metadata";
import { getCurrentOrgCache } from "@/lib/react/cache";
import type { LayoutParams } from "@/types/next";
import { Metadata } from "next";
import { InjectCurrentOrgStore } from "./useCurrentOrg";

export async function generateMetadata({
  params,
}: LayoutParams<{ orgSlug: string }>): Promise<Metadata> {
  return orgMetadata(params.orgSlug);
}

export default async function RouteLayout(
  props: LayoutParams<{ orgSlug: string }>,
) {
  const org = await getCurrentOrgCache(props.params.orgSlug);

  return (
    <InjectCurrentOrgStore
      org={
        org?.org
          ? {
              id: org.org.id,
              slug: org.org.slug,
              name: org.org.name,
              image: org.org.image,
              plan: org.org.plan,
            }
          : undefined
      }
    >
      {props.children}
    </InjectCurrentOrgStore>
  );
}
