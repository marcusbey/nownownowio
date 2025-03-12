"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/feedback/alert";
import { Button } from "@/components/core/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";
import { format } from "date-fns";

type WidgetSetupBannerProps = {
  orgSlug: string;
  isConfigured?: boolean;
  lastGeneratedAt?: Date;
}

export function WidgetSetupBanner({ orgSlug, isConfigured = false, lastGeneratedAt }: WidgetSetupBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  const formattedDate = lastGeneratedAt ? format(new Date(lastGeneratedAt), 'MMM d, yyyy') : null;

  return (
    <Alert className="relative mb-6 border-primary/20 bg-primary/10">
      <div className="flex items-start justify-between">
        <div>
          <AlertTitle className="text-primary">
            {isConfigured ? "Widget configured" : "Set up your widget"}
          </AlertTitle>
          <AlertDescription className="mt-2">
            {isConfigured ? (
              <>
                Your widget is configured and ready to use. 
                {formattedDate && (
                  <span className="mt-1 block text-sm text-muted-foreground">
                    Last generated on {formattedDate}
                  </span>
                )}
              </>
            ) : (
              <>Complete your setup by configuring your widget. This will allow your users to interact with your content directly from your website.</>
            )}
          </AlertDescription>
          <div className="mt-3">
            <Button asChild size="sm" variant="default">
              <Link href={`/orgs/${orgSlug}/settings/widget`} className="inline-flex items-center">
                {isConfigured ? "Reconfigure widget" : "Configure widget"}
                <ExternalLink className="ml-2 size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-full"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          <X className="size-4" />
        </Button>
      </div>
    </Alert>
  );
}
