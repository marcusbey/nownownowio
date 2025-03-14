"use client";

import { Button } from "@/components/core/button";
import { Newspaper, Users } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

type EmptyFeedProps = {
  context?: 'following' | 'profile' | 'default';
}

export function EmptyFeed({ context = 'default' }: EmptyFeedProps) {
  const pathname = usePathname();
  const router = useRouter();

  const messages = {
    following: {
      title: 'No posts from people you follow',
      description: 'Start following other members to see their posts and updates in your feed.',
      action: 'Explore people',
      icon: Users
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

  const { title, description, action, icon: Icon = Newspaper } = messages[context];

  return (
    <div className="flex flex-col items-center justify-center px-4 py-24">
      <div className="mb-6 rounded-full bg-muted/60 p-5">
        <Icon className="size-8 text-muted-foreground/80" />
      </div>
      <div className="mb-8 space-y-2 text-center">
        <h3 className="text-lg font-medium text-foreground/80">{title}</h3>
        <p className="mx-auto max-w-[320px] text-sm leading-relaxed text-muted-foreground/80">
          {description}
        </p>
      </div>
      <Button 
        variant="outline" 
        onClick={() => {
          if (context === 'following') {
            // Navigate to explore page
            const exploreUrl = pathname.replace(/\/following$/, '/explore');
            router.push(exploreUrl);
          } else {
            // Scroll to top for post creation
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        className="font-medium"
      >
        {action}
      </Button>
    </div>
  );
}
