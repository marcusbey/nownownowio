"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgDetailsForm } from "./(details)/OrgDetailsForm";
import { WidgetScriptGenerator } from "./widget/GenerateScript";
import type { Organization } from "@prisma/client";

type SettingsContentProps = {
  organization: Organization;
  orgSlug: string;
};

export function SettingsContent({ organization, orgSlug }: SettingsContentProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization's settings and integrations
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList>
          <TabsTrigger value="organization">Organization Settings</TabsTrigger>
          <TabsTrigger value="widget">Widget Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-4">
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
        </TabsContent>

        <TabsContent value="widget" className="space-y-4">
          <Card className="h-fit border-opacity-20">
            <CardHeader className="space-y-1 py-3">
              <CardTitle className="text-base">Widget Script Generator</CardTitle>
              <CardDescription className="text-xs">
                Generate a script to embed the NowNowNow widget on your website.
              </CardDescription>
            </CardHeader>
            <CardContent className="py-3">
              <WidgetScriptGenerator orgSlug={orgSlug} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
