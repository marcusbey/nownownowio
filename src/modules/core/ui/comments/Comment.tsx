import { deleteComment } from "@/lib/api/comments";
import { CommentData } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MoreHorizontal, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useToast } from "../ui/use-toast";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { motion } from "framer-motion";

interface CommentProps {
  comment: CommentData;
}

export default function Comment({ comment }: CommentProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const userProfileLink =
    session?.user && comment.user.id === session.user.id
      ? `/orgs/${comment.user.organizations?.[0]?.organization?.slug || ""}/profile`
      : `/users/${comment.user.name}`;

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      queryClient.invalidateQueries({
        queryKey: ["comments", comment.postId],
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  };

  return (
    <motion.div 
      className="group flex gap-3 pl-4"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <UserTooltip user={comment.user}>
        <Link href={userProfileLink} className="shrink-0">
          <UserAvatar 
            avatarUrl={comment.user.image} 
            className="h-8 w-8 ring-1 ring-offset-2 ring-primary/10 hover:ring-primary/30 transition-all duration-200" 
          />
        </Link>
      </UserTooltip>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserTooltip user={comment.user}>
              <Link
                href={userProfileLink}
                className="text-sm font-semibold hover:underline"
              >
                {comment.user.displayName || comment.user.name}
              </Link>
            </UserTooltip>
            <span className="text-xs text-muted-foreground" suppressHydrationWarning>
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          {session?.user && comment.user.id === session.user.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full transition-opacity duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <Linkify>
          <p className="text-sm leading-relaxed">{comment.content}</p>
        </Linkify>
      </div>
    </motion.div>
  );
}
