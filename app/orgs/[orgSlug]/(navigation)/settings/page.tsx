"use server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import type { PageParams } from "@/types/next";
import { OrgDetailsForm } from "./(details)/OrgDetailsForm";
import { WidgetScriptGenerator } from "./widget/GenerateScript";
import { SettingsContent } from "./SettingsContent";

type SettingsPageParams = PageParams<{
  orgSlug: string;
}>;

export default async function RoutePage(props: SettingsPageParams) {
  const { org: organization } = await getRequiredCurrentOrgCache(
    props.params.orgSlug,
    ["ADMIN"],
  );

  return (
    <SettingsContent 
      organization={organization} 
      orgSlug={props.params.orgSlug} 
    />
  );
}
