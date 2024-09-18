import { auth } from "@/lib/auth/helper";
import { orgMetadata } from "@/lib/metadata";
import { getCurrentOrgCache } from "@/lib/react/cache";
import type { LayoutParams, PageParams } from "@/types/next";
import { Metadata } from "next";
import SessionProvider from "./(navigation)/SessionProvider";
import { InjectCurrentOrgStore } from "./useCurrentOrg";

export async function generateMetadata({
  params,
}: PageParams<{ orgSlug: string }>): Promise<Metadata> {
  return orgMetadata(params.orgSlug);
}

export default async function RouteLayout(
  props: LayoutParams<{ orgSlug: string }>,
) {
  const session = await auth();
  const org = await getCurrentOrgCache();

  return (
    <SessionProvider value={{ session }}>
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
    </SessionProvider>
  );
}
