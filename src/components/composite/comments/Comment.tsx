"use client";

import UserAvatar from "@/components/composite/UserAvatar";
import UserTooltip from "@/components/composite/UserTooltip";
import Linkify from "@/components/data-display/Linkify";
import type { CommentData } from "@/lib/types";
import { extractUserFromSession } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import CommentMoreButton from "./CommentMoreButton";

type CommentProps = {
  comment: CommentData;
  postOwnerId?: string; // Add postOwnerId prop to check if user is post owner
};

export default function Comment({ comment, postOwnerId }: CommentProps) {
  const { data: session, status } = useSession();
  const [isHovered, setIsHovered] = useState(false);

  // Extract user info using the utility function
  const userInfo = extractUserFromSession(session, status);

  const userProfileLink =
    userInfo && comment.user.id === userInfo.id
      ? `/orgs/${comment.user.memberships[0]?.organization?.slug ?? ""}/profile`
      : `/users/${comment.user.name ?? "unknown"}`;

  // Check if current user is either the comment author or the post owner
  const canDeleteComment =
    userInfo &&
    (comment.user.id === userInfo.id || // Comment author
      postOwnerId === userInfo.id); // Post owner

  return (
    <motion.div
      className="group relative flex items-start gap-3 rounded-xl px-1 py-2.5 transition-all duration-200 hover:bg-muted/20"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <UserTooltip user={comment.user}>
        <Link href={userProfileLink} className="mt-1 shrink-0 self-start">
          <UserAvatar
            avatarUrl={comment.user.image ?? null}
            size={32}
            className="shadow-sm ring-1 ring-primary/20 ring-offset-1 transition-all duration-200 hover:ring-primary/40"
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

          {canDeleteComment && (
            <CommentMoreButton
              comment={comment}
              className={`absolute right-2 top-2 size-7 rounded-full transition-all duration-200 ${
                isHovered ? "opacity-100" : "opacity-0"
              } hover:bg-background`}
            />
          )}
        </div>

        <div className="rounded-xl bg-muted/30 px-4 py-3 shadow-sm backdrop-blur-sm">
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
