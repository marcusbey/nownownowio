"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/data-display/tabs";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SectionLayout } from "./SectionLayout";
import { Button } from "@/components/core/button";
import { Play } from "lucide-react";

export function WidgetShowcase() {
  const [activeTab, setActiveTab] = useState("preview");

  return (
    <SectionLayout>
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Easy to integrate, powerful to use
        </h2>
        <p className="mt-4 text-center text-lg text-muted-foreground">
          Add the widget to your website with a single line of code
        </p>
      </div>

      <div className="mt-16 flex flex-col gap-8 lg:flex-row">
        {/* Left side - Widget Preview */}
        <div className="w-full lg:w-1/2">
          <div className="relative mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10"></div>
              <div>
                <h3 className="font-semibold">Jane Doe</h3>
                <p className="text-sm text-muted-foreground">Product designer & developer</p>
              </div>
            </div>
            <p className="mb-2 text-sm text-muted-foreground">1234 followers</p>
            
            {/* Posts */}
            <div className="space-y-6">
              <div>
                <p className="mb-1 text-sm text-muted-foreground">2 hours ago</p>
                <p className="mb-2">Finished the new landing page design. The team loved the clean, modern look. Next step: user testing.</p>
                <div className="flex gap-4">
                  <span className="text-sm text-muted-foreground">5 likes</span>
                  <span className="text-sm text-muted-foreground">12 replies</span>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm text-muted-foreground">Yesterday</p>
                <p className="mb-2">Working on the checkout flow. Focusing on reducing friction and cart abandonment. Any suggestions?</p>
                <div className="flex gap-4">
                  <span className="text-sm text-muted-foreground">3 likes</span>
                  <span className="text-sm text-muted-foreground">8 replies</span>
                </div>
              </div>

              <div>
                <p className="mb-1 text-sm text-muted-foreground">3 days ago</p>
                <p className="mb-2">User testing scheduled for next week. Excited to get real feedback on our new features!</p>
                <div className="flex gap-4">
                  <span className="text-sm text-muted-foreground">2 likes</span>
                  <span className="text-sm text-muted-foreground">5 replies</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Code Tabs */}
        <div className="w-full lg:w-1/2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Implementation</h3>
            <Button
              size="icon"
              className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90"
              onClick={() => {
                // Add demo functionality here
                console.log("Demo clicked");
              }}
            >
              <Play className="h-6 w-6 text-primary-foreground" />
            </Button>
          </div>

          <Tabs defaultValue="header" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="header" className="flex-1">
                Header
              </TabsTrigger>
              <TabsTrigger value="body" className="flex-1">
                Body
              </TabsTrigger>
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
        </div>
      </div>
    </SectionLayout>
  );
}
