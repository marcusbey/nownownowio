"use server";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/data-display/tabs";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getCurrentOrg } from "@/lib/organizations/get-org";
import type { PageParams } from "@/types/next";
import { OrgDetailsForm } from "./(details)/OrgDetailsForm";
import { WidgetScriptGenerator } from "./widget/GenerateScript";
import { SettingsContent } from "./SettingsContent";
import { notFound } from "next/navigation";
import { logger } from "@/lib/logger";

type SettingsPageParams = PageParams<{
  orgSlug: string;
}>;

export default async function RoutePage(props: SettingsPageParams) {
  // First get the org without role requirements to debug
  const orgResult = await getCurrentOrg(props.params.orgSlug);
  
  if (orgResult) {
    logger.info("User roles for organization:", {
      orgSlug: props.params.orgSlug,
      roles: orgResult.roles,
    });
  }

  try {
    const { org: organization } = await getRequiredCurrentOrgCache(
      props.params.orgSlug,
      ["ADMIN", "OWNER"]
    );

    return (
      <SettingsContent 
        organization={organization} 
        orgSlug={props.params.orgSlug} 
      />
    );
  } catch (error) {
    logger.error("Error accessing settings page:", error);
    notFound();
  }
}
