"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/composite/dropdown-menu";
import UserAvatar from "@/components/composite/UserAvatar";
import UserTooltip from "@/components/composite/UserTooltip";
import { Button } from "@/components/core/button";
import Linkify from "@/components/data-display/Linkify";
import { useToast } from "@/components/feedback/use-toast";
import { deleteComment } from "@/lib/api/comments";
import type { CommentData } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

type CommentProps = {
  comment: CommentData;
};

export default function Comment({ comment }: CommentProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isHovered, setIsHovered] = useState(false);

  const userProfileLink =
    session?.user && comment.user.id === session.user.id
      ? `/orgs/${comment.user.memberships[0]?.organization?.slug ?? ""}/profile`
      : `/users/${comment.user.name ?? "unknown"}`;

  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      await queryClient.invalidateQueries({
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
      className="group relative flex items-start gap-3 px-1 py-2.5 rounded-xl transition-all duration-200 hover:bg-muted/20"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <UserTooltip user={comment.user}>
        <Link href={userProfileLink} className="shrink-0 self-start mt-1">
          <UserAvatar
            avatarUrl={comment.user.image ?? null}
            size={32}
            className="ring-1 ring-primary/20 ring-offset-1 shadow-sm transition-all duration-200 hover:ring-primary/40"
          />
        </Link>
      </UserTooltip>

      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserTooltip user={comment.user}>
              <Link
                href={userProfileLink}
                className="text-sm font-semibold text-foreground transition-colors hover:text-primary hover:underline"
              >
                {comment.user.displayName ??
                  comment.user.name ??
                  "Unknown User"}
              </Link>
            </UserTooltip>
            <span
              className="text-xs text-muted-foreground/80"
              suppressHydrationWarning
            >
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
                  className={`absolute right-2 top-2 size-7 rounded-full transition-all duration-200 ${
                    isHovered ? "opacity-100" : "opacity-0"
                  } hover:bg-background`}
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete comment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="rounded-xl bg-muted/30 backdrop-blur-sm px-4 py-3 shadow-sm">
          <Linkify>
            <p className="text-sm leading-relaxed text-foreground/90">
              {comment.content}
            </p>
          </Linkify>
        </div>
      </div>
    </motion.div>
  );
}
