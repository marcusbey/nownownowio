"use client";

import UserAvatar from "@/components/composite/UserAvatar";
import UserTooltip from "@/components/composite/UserTooltip";
import { Button } from "@/components/core/button";
import Linkify from "@/components/data-display/Linkify";
import { usePostViews } from "@/hooks/use-post-views";
import type { PostData } from "@/lib/types";
import { cn, extractUserFromSession, formatRelativeDate } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, MessageSquare, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import LikeButton from "./like-button";
import { BookmarkButton, PostMoreButton } from "./post-actions";

const LazyMediaPreviews = lazy(async () =>
  import("../components/media-preview").then((mod) => ({
    default: mod.MediaPreviews,
  })),
);
const Comments = lazy(async () =>
  import("@/components/composite/comments/Comments").then((mod) => ({
    default: mod.default,
  })),
);

const CommentInput = lazy(async () =>
  import("@/components/composite/comments/CommentInput").then((mod) => ({
    default: mod.default,
  })),
);

type PostProps = {
  post: PostData;
};

export default function Post({ post }: PostProps) {
  const { data: session, status } = useSession();
  const user = extractUserFromSession(session, status);
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { views, isLoading } = usePostViews(post.id);

  useEffect(() => {
    setIsClient(true);

    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log(
        "Post component - Session status:",
        status,
        "| User info:",
        user ? `${user.email} (${user.id})` : "No user",
        "| Session valid:",
        user ? "Yes" : "No",
      );
    }
  }, [status, session, user]);

  const handleCommentClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isClient) return false;

      // Make sure we prevent default and stop propagation
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      // Toggle comment visibility
      setShowComments((prev) => !prev);

      // Prevent any potential page reload
      return false;
    },
    [isClient],
  );

  const userProfileLink = useMemo(() => {
    if (user?.email && post.user.id === user.id) {
      const userMemberships = Array.isArray(post.user.memberships)
        ? post.user.memberships
        : [];
      const orgSlug =
        userMemberships.length > 0
          ? userMemberships[0].organization.slug
          : undefined;

      return `/orgs/${orgSlug ?? ""}/profile`;
    }
    return `/users/${post.user.name ?? ""}`;
  }, [user, post.user]);

  const isOwnPost = useMemo(() => {
    if (!user) return false;
    return user.email === post.userId;
  }, [user, post.userId]);

  const displayName = useMemo(() => {
    return post.user.name ?? "Unknown User";
  }, [post.user.name]);

  const mediaItems = Array.isArray(post.media) ? post.media : [];
  const hasAttachments = mediaItems.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group/post space-y-3 p-4 transition-colors duration-200 hover:bg-muted/20"
      onHoverStart={() => isClient && setIsHovered(true)}
      onHoverEnd={() => isClient && setIsHovered(false)}
      suppressHydrationWarning
      layout
    >
      <div className="flex justify-between gap-3">
        <div className="flex items-start gap-3">
          <UserTooltip user={post.user}>
            <Link href={userProfileLink} className="shrink-0">
              <UserAvatar
                avatarUrl={post.user.image}
                className="size-10 ring-1 ring-primary/10 ring-offset-2 transition-all duration-200 hover:ring-primary/30"
              />
            </Link>
          </UserTooltip>
          <div className="flex min-w-0 flex-1 flex-col">
            <UserTooltip user={post.user}>
              <Link
                href={userProfileLink}
                className="font-semibold decoration-primary/30 hover:underline"
              >
                {displayName}
              </Link>
            </UserTooltip>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link
                href={`/posts/${post.id}`}
                className="transition-colors duration-200 hover:text-primary"
                suppressHydrationWarning
              >
                {formatRelativeDate(post.createdAt)}
              </Link>
              <span>•</span>
              <span className="flex items-center gap-0.5 transition-colors duration-200 hover:text-primary">
                <Eye className="size-3" />
                {(views || 0) + 1}
              </span>
            </div>
          </div>
        </div>
        {isOwnPost && (
          <PostMoreButton
            postId={post.id}
            onDelete={(postId) => {
              console.log("Delete post:", postId);
              // You'd typically handle post deletion here
              // For example, redirect or remove from the UI
            }}
            className={cn(
              "transition-opacity duration-200",
              isHovered ? "opacity-100" : "opacity-0",
            )}
          />
        )}
      </div>

      <Linkify>
        <div
          className={cn(
            "prose prose-stone dark:prose-invert prose-sm",
            "max-w-none whitespace-pre-line break-words text-[15px] leading-relaxed text-foreground/90 py-3 px-2",
            "[&_[data-hashtag]]:text-blue-500 [&_[data-hashtag]]:hover:underline [&_[data-hashtag]]:cursor-pointer",
          )}
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </Linkify>

      {hasAttachments && (
        <div className="mt-2 overflow-hidden rounded-lg">
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-lg bg-muted" />
            }
          >
            <LazyMediaPreviews attachments={mediaItems} />
          </Suspense>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between pt-2">
        <div className="flex items-center gap-6">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count?.likes || 0,
              isLikedByUser:
                post.likes && Array.isArray(post.likes) &&
                post.likes.some((like) => like?.userId === user?.id),
            }}
            className="flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-primary"
          />
          <CommentButton post={post} onClick={handleCommentClick} />
          <Button
            variant="ghost"
            size="sm"
            type="button" // Explicitly set type to button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigator
                .share({
                  url: `${window.location.origin}/posts/${post.id}`,
                  title: `Post by ${post.user.displayName ?? post.user.name}`,
                  text: post.content,
                })
                .catch((error) => console.error("Share failed:", error));

              // Prevent any potential page reload
              return false;
            }}
            className="-ml-2 flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-primary"
          >
            <Share2 className="size-4" />
            <span className="text-xs">Share</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="size-3.5" />
            {(views || 0) + 1}
          </span>
          <BookmarkButton
            postId={post.id}
            initialBookmarked={
              Array.isArray(post.bookmarks) &&
              post.bookmarks.some((bookmark) => bookmark.userId === user?.id)
            }
            className="text-muted-foreground transition-colors duration-200 hover:text-primary"
          />
        </div>
      </div>

      {/* Comment section - Using CSS only for transitions */}
      <div>
        {/* Only render comments when showComments is true to avoid unnecessary DOM elements */}
        {showComments && (
          <div className="mt-2 animate-fade-in border-t pt-4">
            {/* Comment input shown above comments when comment button is clicked */}
            <CommentInput post={post} />

            {/* Comment list with showInput=false since we're handling it separately */}
            <Comments post={post} showInput={false} />
          </div>
        )}

        {/* Debug info removed */}
      </div>
    </motion.article>
  );
}

type CommentButtonProps = {
  post: PostData;
  onClick: (e: React.MouseEvent) => void;
};

function CommentButton({ post, onClick }: CommentButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Handle both post._count.comments (from standard API) and post.commentCount (from user posts API)
  const commentCount =
    // Check standard API format with optional chaining
    post._count?.comments !== undefined
      ? post._count.comments
      : // Check user posts API format
        (post as any).commentCount !== undefined
        ? (post as any).commentCount
        : // Fallback
          0;

  return (
    <Button
      variant="ghost"
      size="sm"
      type="button" // Explicitly set type to button
      onClick={(e) => {
        // Ensure we stop default behavior before anything else happens
        if (e) {
          e.preventDefault(); // Prevent default browser action
          e.stopPropagation(); // Stop event bubbling
        }

        // Visual feedback
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 200);

        // Call the parent onClick handler (which also has preventDefault)
        if (onClick) onClick(e);
        
        // Cancel the event's default action
        return false;
      }}
      onMouseDown={(e) => {
        // Also prevent default on mouse down
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`-ml-2 flex items-center gap-1.5 ${isPressed ? "text-primary" : isHovered ? "text-primary/80" : "text-muted-foreground"} transition-colors duration-200`}
    >
      <MessageSquare className="size-4" />
      <span className="text-xs font-medium">{commentCount}</span>
    </Button>
  );
}

export function PostFeed() {
  const {
    data: feedData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["post-feed"],
    queryFn: async () => {
      return fetch("/api/v1/posts").then(async (res) => res.json());
    },
  });

  if (isLoading) return <div>Loading feed...</div>;

  return (
    <div>
      {feedData?.map((post: { id: string; content: string }) => (
        <p key={post.id}>{post.content}</p>
      ))}
    </div>
  );
}
