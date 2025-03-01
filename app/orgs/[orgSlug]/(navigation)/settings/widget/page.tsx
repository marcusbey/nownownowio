"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WidgetScriptGenerator } from "./GenerateScript";

export default function WidgetPage({
  params,
}: {
  params: { orgSlug: string };
}) {
  return (
    <div className="container max-w-4xl py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">Widget Integration</h2>
        <p className="text-sm text-muted-foreground">
          Generate and customize your NowNowNow widget integration
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Widget Script Generator</CardTitle>
          <CardDescription>
            Generate a script to embed the NowNowNow widget on your website. 
            Follow the instructions below to integrate the widget into your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WidgetScriptGenerator orgSlug={params.orgSlug} />
        </CardContent>
      </Card>
    </div>
  );
}
