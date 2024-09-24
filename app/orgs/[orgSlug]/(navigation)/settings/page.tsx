import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { OrgDetailsForm } from "./(details)/OrgDetailsForm";

type SettingsPageParams = PageParams<{
  orgSlug: string;
}>;

export default async function RoutePage(props: SettingsPageParams) {
  const { org: organization } = await getRequiredCurrentOrgCache(
    props.params.orgSlug,
    ["ADMIN"],
  );
  return <OrgDetailsForm defaultValues={organization} />;
}
