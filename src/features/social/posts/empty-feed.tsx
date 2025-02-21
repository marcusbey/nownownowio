"use client";

import { Button } from "@/components/core/button";
import { Newspaper } from "lucide-react";
import { usePathname } from "next/navigation";

interface EmptyFeedProps {
  context?: 'following' | 'profile' | 'default';
}

export function EmptyFeed({ context = 'default' }: EmptyFeedProps) {
  const pathname = usePathname();

  const messages = {
    following: {
      title: 'No posts from people you follow',
      description: 'Follow more people to see their posts in your feed.',
      action: 'Explore posts'
    },
    profile: {
      title: 'No posts yet',
      description: 'Share your first update, start a discussion, or post something interesting with your organization.',
      action: 'Create your first post'
    },
    default: {
      title: 'Your feed is empty',
      description: 'Share your first update, start a discussion, or post something interesting with your organization.',
      action: 'Create your first post'
    }
  };

  const { title, description, action } = messages[context];

  return (
    <div className="flex flex-col items-center justify-center py-24 px-4">
      <div className="p-5 rounded-full bg-muted/60 mb-6">
        <Newspaper className="h-8 w-8 text-muted-foreground/80" />
      </div>
      <div className="text-center space-y-2 mb-8">
        <h3 className="font-medium text-lg text-foreground/80">{title}</h3>
        <p className="text-sm text-muted-foreground/80 max-w-[320px] mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="font-medium"
      >
        {action}
      </Button>
    </div>
  );
}
