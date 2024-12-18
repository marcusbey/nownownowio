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
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Organization Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your organization's settings and integrations
        </p>
      </div>

      <Tabs defaultValue="organization" className="space-y-6">
        <TabsList className="w-full justify-start border-b pb-px">
          <TabsTrigger value="organization" className="relative">
            Organization Details
          </TabsTrigger>
          <TabsTrigger value="widget" className="relative">
            Widget Integration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Organization Details</CardTitle>
              <CardDescription>
                Customize your organization's appearance and information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrgDetailsForm defaultValues={organization} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="widget">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Widget Script Generator</CardTitle>
              <CardDescription>
                Generate a script to embed the NowNowNow widget on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WidgetScriptGenerator orgSlug={orgSlug} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
