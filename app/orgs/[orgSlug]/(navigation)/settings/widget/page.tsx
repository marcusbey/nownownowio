"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";
import { WidgetScriptGenerator } from "./GenerateScript";
import { WidgetTutorial } from "./WidgetTutorial";
import { use } from "react";

export default function WidgetPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  // Properly unwrap the params Promise using React.use()
  const resolvedParams = use(params);
  const orgSlug = resolvedParams.orgSlug;
  
  return (
    <div className="py-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Widget Integration</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Generate and customize your NowNowNow widget integration for your website
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Widget Script Generator</CardTitle>
          <CardDescription>
            Generate a script to embed the NowNowNow widget on your website. 
            Follow the instructions below to integrate the widget into your site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WidgetScriptGenerator orgSlug={orgSlug} />
        </CardContent>
      </Card>
      
      <WidgetTutorial />
    </div>
  );
}
