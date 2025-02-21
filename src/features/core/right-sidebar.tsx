import { Card } from "@/components/data-display/card";
import { Typography } from "@/components/data-display/typography";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Button } from "@/components/core/button";
import { Search } from "lucide-react";
import Link from "next/link";

const SUGGESTED_USERS = [
  { name: "Sarah Connor", handle: "@sarahc", image: null },
  { name: "John Doe", handle: "@johndoe", image: null },
  { name: "Jane Smith", handle: "@janesmith", image: null },
];

const TRENDING_TOPICS = [
  { topic: "#ArtificialIntelligence", posts: "12.5K" },
  { topic: "#WebDevelopment", posts: "8.2K" },
  { topic: "#Innovation", posts: "6.9K" },
  { topic: "#TechNews", posts: "5.4K" },
];

export function RightSidebar() {
  return (
    <aside className="hidden lg:block w-[320px] shrink-0 border-l border-border h-screen sticky top-0 p-4 overflow-y-auto bg-card/50">
      <div className="space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search posts, people, or topics"
            className="w-full rounded-lg bg-background pl-10 pr-4 py-2 text-sm border border-border"
          />
        </div>

        {/* Who to follow */}
        <Card className="p-4 bg-card/50">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h4">Who to follow</Typography>
            <Link href="/explore/people" className="text-sm text-yellow-500 hover:text-yellow-400">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {SUGGESTED_USERS.map((user, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="size-10">
                    <AvatarImage src={user.image || undefined} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Typography className="font-medium">{user.name}</Typography>
                    <Typography className="text-sm text-muted-foreground">{user.handle}</Typography>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="ml-auto">
                  Follow
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Trending topics */}
        <Card className="p-4 bg-card/50">
          <div className="flex items-center justify-between mb-4">
            <Typography variant="h4">Trending topics</Typography>
            <Link href="/explore/topics" className="text-sm text-yellow-500 hover:text-yellow-400">
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {TRENDING_TOPICS.map((topic, index) => (
              <div key={index} className="group">
                <Link href={`/topics/${topic.topic.slice(1)}`} className="block">
                  <Typography className="font-medium group-hover:text-yellow-500">
                    {topic.topic}
                  </Typography>
                  <Typography className="text-sm text-muted-foreground">
                    {topic.posts} posts
                  </Typography>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </aside>
  );
}
