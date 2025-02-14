import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { MessageCircle, Heart, Bookmark } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Post, Comment, Organization, User } from "@prisma/client";

type ExtendedPost = Post & {
  organization: Organization;
  user: User;
  _count: {
    comments: number;
    likes: number;
  };
};

type PostCardProps = {
  post: ExtendedPost;
};

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <Avatar className="size-10">
          <AvatarImage src={post.organization.image ?? ''} />
          <AvatarFallback>{post.organization.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold">{post.organization.name}</span>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(post.createdAt, { addSuffix: true })}
          </span>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <p className="whitespace-pre-wrap">{post.content}</p>
      </CardContent>
      <CardFooter className="flex justify-between border-t px-6 py-3">
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageCircle className="size-4" />
          <span>{post._count.comments}</span>
        </Button>
        <Button variant="ghost" size="sm" className="gap-2">
          <Heart className="size-4" />
          <span>{post._count.likes}</span>
        </Button>
        <Button variant="ghost" size="sm">
          <Bookmark className="size-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};
