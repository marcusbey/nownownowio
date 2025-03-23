"use client";

import { Button } from "@/components/core/button";
import { MessageSquare } from "lucide-react";
import { ContactFeedbackPopover } from "@/features/communication/contact/feedback/contact-feedback-popover";

export function FeedbackButton() {
  return (
    <ContactFeedbackPopover>
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
      >
        <MessageSquare className="size-4" />
        <span>Send Feedback</span>
      </Button>
    </ContactFeedbackPopover>
  );
}
