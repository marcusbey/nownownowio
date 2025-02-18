import { Button } from "@/components/core/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/data-display/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageCircle, Share } from "lucide-react";
import Link from "next/link";

type PostCardProps = {
  post: {
    id: string;
    content: string;
    createdAt: Date;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    _count: {
      likes: number;
      comments: number;
    };
  };
  className?: string;
};

export function PostCard({ post, className }: PostCardProps) {
  return (
    <div className={cn("border-b p-4", className)}>
      <div className="flex gap-3">
        <Avatar>
          <AvatarImage
            src={post.user.image ?? undefined}
            alt={post.user.name ?? "User"}
          />
          <AvatarFallback>{post.user.name?.[0] ?? "U"}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Link
              href={`/users/${post.user.id}`}
              className="font-medium hover:underline"
            >
              {post.user.name}
            </Link>
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(post.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="whitespace-pre-wrap">{post.content}</p>
          <div className="flex gap-4 pt-2">
            <Button variant="ghost" size="sm" className="gap-1">
              <Heart className="size-4" />
              {post._count.likes}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <MessageCircle className="size-4" />
              {post._count.comments}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1">
              <Share className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
