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
    <div className="mx-auto max-w-4xl py-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold">Widget Integration</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate and customize your NowNowNow widget integration for your website
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardContent>
          <WidgetScriptGenerator orgSlug={orgSlug} />
        </CardContent>
      </Card>
      <WidgetTutorial />
    </div>
  );
}
