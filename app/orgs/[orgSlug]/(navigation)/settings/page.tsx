import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { OrgDetailsForm } from "./(details)/OrgDetailsForm";
import { WidgetScriptGenerator } from "./widget/page";

type SettingsPageParams = PageParams<{
  orgSlug: string;
}>;

export default async function RoutePage(props: SettingsPageParams) {
  const { org: organization } = await getRequiredCurrentOrgCache(
    props.params.orgSlug,
    ["ADMIN"],
  );

  return (
    <div className="space-y-6">
      <OrgDetailsForm defaultValues={organization} />

      <Card>
        <CardHeader>
          <CardTitle>Widget Script Generator</CardTitle>
          <CardDescription>
            Generate a script to embed the NowNowNow widget on your website.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WidgetScriptGenerator orgSlug={props.params.orgSlug} />
        </CardContent>
      </Card>
    </div>
  );
}
