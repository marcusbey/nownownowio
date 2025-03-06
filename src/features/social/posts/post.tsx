"use client";

import UserAvatar from "@/components/composite/UserAvatar";
import UserTooltip from "@/components/composite/UserTooltip";
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
import { useDeletePostMutation } from "./mutations";
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
  // Comments should be closed by default, only opened when user clicks
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [firstMount, setFirstMount] = useState(true);
  const { views, isLoading } = usePostViews(post.id);
  const deletePostMutation = useDeletePostMutation();

  useEffect(() => {
    setIsClient(true);

    // On first render in client, set firstMount to false after a brief delay
    // This prevents the first click from triggering unwanted behaviors
    const timer = setTimeout(() => {
      setFirstMount(false);
    }, 500);

    // Development logging removed

    return () => clearTimeout(timer);
  }, [status, session, user]);

  // Simple comment click handler that prevents default and toggles comments
  const handleCommentClick = useCallback((e: React.MouseEvent | null) => {
    if (!isClient) return;
    
    // If event exists, prevent default behavior
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Toggle comments visibility
    setShowComments(prev => !prev);
  }, [isClient]);

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
    return user.id === post.user.id;
  }, [user, post.user.id]);

  const displayName = useMemo(() => {
    return post.user.name ?? "Unknown User";
  }, [post.user.name]);

  const mediaItems = Array.isArray(post.media) ? post.media : [];
  const hasAttachments = mediaItems.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group/post mb-4 space-y-3 rounded-lg border border-border/60 bg-background p-5 shadow-sm transition-colors duration-200 hover:bg-muted/10"
      onHoverStart={() => isClient && setIsHovered(true)}
      onHoverEnd={() => isClient && setIsHovered(false)}
      suppressHydrationWarning
      // Disable any layout animations
      transition={{ layout: { duration: 0 } }}
      layoutRoot
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
              deletePostMutation.mutate(postId);
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

      {/* Wrap action buttons in a div with preventDefault to ensure no form submissions */}
      <div
        className="mt-4 flex items-center justify-between pt-2"
        onClick={(e) => {
          if (typeof e.preventDefault === "function") e.preventDefault();
          if (typeof e.stopPropagation === "function") e.stopPropagation();
          return false;
        }}
      >
        <div
          className="flex items-center gap-6"
          onClick={(e) => {
            if (typeof e.preventDefault === "function") e.preventDefault();
            if (typeof e.stopPropagation === "function") e.stopPropagation();
            return false;
          }}
        >
          <LikeButton
            postId={post.id}
            initialState={{
              likes: (post._count && post._count.likes) || 0,
              isLikedByUser:
                post.likes &&
                Array.isArray(post.likes) &&
                post.likes.some((like) => like.userId === user?.id),
            }}
            className="flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-primary"
          />
          <CommentButton post={post} onClick={handleCommentClick} />
          <button
            type="button"
            onClick={(e) => {
              if (typeof e.preventDefault === "function") {
                e.preventDefault();
                if (typeof e.stopPropagation === "function") {
                  e.stopPropagation();
                }
              }
              navigator
                .share({
                  url: `${window.location.origin}/posts/${post.id}`,
                  title: `Post by ${post.user.displayName ?? post.user.name}`,
                  text: post.content,
                })
                .catch((error) => console.error("Share failed:", error));

              // Return false to prevent any potential page reload
              return false;
            }}
            onKeyDown={(e) => {
              // Handle keyboard accessibility
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                navigator
                  .share({
                    url: `${window.location.origin}/posts/${post.id}`,
                    title: `Post by ${post.user.displayName ?? post.user.name}`,
                    text: post.content,
                  })
                  .catch((error) => console.error("Share failed:", error));
              }
            }}
            onMouseDown={(e) => {
              // Also prevent default on mouse down
              e.preventDefault();
              e.stopPropagation();
            }}
            className="-ml-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-3 text-xs text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-primary"
          >
            <Share2 className="size-4" />
            <span className="text-xs">Share</span>
          </button>
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

      {/* Comment section - Absolutely no animations */}
      <div
        style={{ transition: "none !important", animation: "none !important" }}
      >
        {/* Only render comment input and comments when showComments is true */}
        {showComments && (
          <div
            className="mt-2 border-t pt-4"
            style={{
              transition: "none !important",
              animation: "none !important",
              opacity: 1,
            }}
          >
            {/* Comment input shown only when comments are expanded */}
            <CommentInput post={post} />

            {/* Comment list with showInput=false since we're handling it separately */}
            <Comments post={post} showInput={false} />
          </div>
        )}
      </div>
    </motion.article>
  );
}

type CommentButtonProps = {
  post: PostData;
  onClick: (e: React.MouseEvent | null) => void;
};

function CommentButton({ post, onClick }: CommentButtonProps) {
  // Handle both post._count.comments (from standard API) and post.commentCount (from user posts API)
  const commentCount =
    // Check if post._count exists and has comments property
    (post._count && post._count.comments !== undefined)
      ? post._count.comments
      : // Check user posts API format
      (post as any).commentCount !== undefined
        ? (post as any).commentCount
        : // Fallback
          0;

  // Use the count directly from post data for simplicity
  const totalComments = commentCount;

  // Simple click handler that just calls the onClick prop
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick(e);
  };

  return (
    <button
      type="button" // CRITICAL: Explicitly set type to button to prevent form submission
      onClick={handleClick}
      className="-ml-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-3 text-xs text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-primary"
    >
      <MessageSquare className="size-4" />
      <span className="text-xs font-medium">{totalComments}</span>
    </button>
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
