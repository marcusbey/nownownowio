"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/feedback/alert";
import { Button } from "@/components/core/button";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { X } from "lucide-react";

type WidgetSetupBannerProps = {
  orgSlug: string;
}

export function WidgetSetupBanner({ orgSlug }: WidgetSetupBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <Alert className="relative mb-6 border-primary/20 bg-primary/10">
      <div className="flex items-start justify-between">
        <div>
          <AlertTitle className="text-primary">Set up your widget</AlertTitle>
          <AlertDescription className="mt-2">
            Complete your setup by configuring your widget. This will allow your users to interact with your content directly from your website.
          </AlertDescription>
          <div className="mt-3">
            <Button asChild size="sm" variant="default">
              <Link href={`/orgs/${orgSlug}/settings/widget`} className="inline-flex items-center">
                Configure widget
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
