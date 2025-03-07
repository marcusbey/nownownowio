"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/data-display/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/data-display/card";

export function WidgetTutorial() {
  return (
    <Card className="border shadow-sm mt-8">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Integration Guide</CardTitle>
        <CardDescription>
          Learn how to add the NowNowNow widget to your website by following these examples
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            You can add the widget script to your website either in the <code className="text-xs bg-muted px-1 py-0.5 rounded">head</code> or 
            before the closing <code className="text-xs bg-muted px-1 py-0.5 rounded">body</code> tag of your HTML. 
            Choose the method that works best for your website setup.
          </p>

          <Tabs defaultValue="header" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-2">
              <TabsTrigger value="header">In &lt;head&gt; tag</TabsTrigger>
              <TabsTrigger value="body">Before &lt;/body&gt; tag</TabsTrigger>
            </TabsList>

            <TabsContent value="header" className="mt-4">
              <div className="relative rounded-lg bg-muted p-4">
                <pre className="overflow-x-auto text-sm">
                  <code className="text-primary">
{`<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
    
    <!-- Add the Now Widget script in the head -->
    <script 
      defer 
      src="https://nownownow.io/dist/now-widget.js" 
      data-user-id="DEMO_USER_ID" 
      data-token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJERU1PX1VTRVIiLCJpYXQiOjE3MzAwMDAwMDAsImV4cCI6MTczMDAwMDAwMH0.DEMO_TOKEN_SIGNATURE" 
      data-theme="dark" 
      data-position="left" 
      data-button-color="#1a73e8" 
      data-button-size="90">
    </script>
</head>
<body>
    <!-- Your website content -->
</body>
</html>`}
                  </code>
                </pre>
              </div>
            </TabsContent>
            
            <TabsContent value="body" className="mt-4">
              <div className="relative rounded-lg bg-muted p-4">
                <pre className="overflow-x-auto text-sm">
                  <code className="text-primary">
{`<!DOCTYPE html>
<html>
<head>
    <title>Your Website</title>
</head>
<body>
    <!-- Your website content -->

    <!-- Add the Now Widget script before closing body tag -->
    <script 
      defer 
      src="https://nownownow.io/dist/now-widget.js" 
      data-user-id="DEMO_USER_ID" 
      data-token="DEMO_TOKEN"
      data-theme="dark">
    </script>
</body>
</html>`}
                  </code>
                </pre>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 space-y-3">
            <h4 className="text-sm font-medium">Script Attributes</h4>
            <ul className="text-sm space-y-2">
              <li className="flex gap-2">
                <code className="text-xs bg-muted px-1 py-0.5 rounded shrink-0">data-user-id</code>
                <span className="text-muted-foreground">Your unique NowNowNow user ID (automatically included in generated script)</span>
              </li>
              <li className="flex gap-2">
                <code className="text-xs bg-muted px-1 py-0.5 rounded shrink-0">data-token</code>
                <span className="text-muted-foreground">Authentication token for your widget (automatically included in generated script)</span>
              </li>
              <li className="flex gap-2">
                <code className="text-xs bg-muted px-1 py-0.5 rounded shrink-0">data-theme</code>
                <span className="text-muted-foreground">Widget theme: "light" or "dark"</span>
              </li>
              <li className="flex gap-2">
                <code className="text-xs bg-muted px-1 py-0.5 rounded shrink-0">data-position</code>
                <span className="text-muted-foreground">Widget position: "left" or "right"</span>
              </li>
              <li className="flex gap-2">
                <code className="text-xs bg-muted px-1 py-0.5 rounded shrink-0">data-button-color</code>
                <span className="text-muted-foreground">Color of the widget button in hex format (e.g., "#1a73e8")</span>
              </li>
              <li className="flex gap-2">
                <code className="text-xs bg-muted px-1 py-0.5 rounded shrink-0">data-button-size</code>
                <span className="text-muted-foreground">Size of the widget button in pixels (40-120)</span>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
