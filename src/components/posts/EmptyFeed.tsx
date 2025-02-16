"use client";

import { Button } from "../ui/button";
import { Newspaper } from "lucide-react";

export function EmptyFeed() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="p-5 rounded-full bg-muted/60 mb-6">
        <Newspaper className="h-8 w-8 text-muted-foreground/80" />
      </div>
      <div className="text-center space-y-2 mb-8">
        <h3 className="font-medium text-lg text-foreground/80">Your feed is empty</h3>
        <p className="text-sm text-muted-foreground/80 max-w-[320px] mx-auto leading-relaxed">
          Share your first update, start a discussion, or post something interesting with your organization.
        </p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="font-medium"
      >
        Create your first post
      </Button>
    </div>
  );
}
