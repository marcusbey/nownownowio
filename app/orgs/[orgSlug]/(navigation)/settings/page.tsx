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
import { WidgetScriptGenerator } from "./widget/GenerateScript";

type SettingsPageParams = PageParams<{
  orgSlug: string;
}>;

export default async function RoutePage(props: SettingsPageParams) {
  const { org: organization } = await getRequiredCurrentOrgCache(
    props.params.orgSlug,
    ["ADMIN"],
  );

  return (
    <div className="space-y-8 pl-8">
      <div>
        <h2 className="text-lg font-medium">Organization Settings</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your organization's profile and appearance
        </p>
      </div>

      <Card className="border-opacity-20">
        <CardHeader className="space-y-1.5">
          <CardTitle className="text-lg">Organization Details</CardTitle>
          <CardDescription className="text-sm">
            Customize your organization's appearance and information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrgDetailsForm defaultValues={organization} />
        </CardContent>
      </Card>

      <div className="border-t border-border/40 pt-8">
        <h2 className="text-lg font-medium">Widget Integration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Customize and generate the widget code for your website
        </p>
      </div>

      <Card className="h-fit border-opacity-20">
        <CardHeader className="space-y-1 py-3">
          <CardTitle className="text-base">Widget Script Generator</CardTitle>
          <CardDescription className="text-xs">
            Generate a script to embed the NowNowNow widget on your website.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-3">
          <WidgetScriptGenerator orgSlug={props.params.orgSlug} />
        </CardContent>
      </Card>
    </div>
  );
}
