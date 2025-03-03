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
  // Comments should be closed by default, only opened when user clicks
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [firstMount, setFirstMount] = useState(true);
  const { views, isLoading } = usePostViews(post.id);

  useEffect(() => {
    setIsClient(true);
    
    // On first render in client, set firstMount to false after a brief delay
    // This prevents the first click from triggering unwanted behaviors
    const timer = setTimeout(() => {
      setFirstMount(false);
    }, 500);
    
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
    
    return () => clearTimeout(timer);
  }, [status, session, user]);

  // Robust click handler to prevent page reloads on first click and handle comments toggle
  const handleCommentClick = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent | null) => {
      try {
        // Comprehensive event prevention - stop all default behaviors
        if (e) {
          // Prevent default at all levels
          if (typeof e.preventDefault === 'function') e.preventDefault();
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
          
          // Handle native event if available
          const nativeEvent = 'nativeEvent' in e ? e.nativeEvent : null;
          if (nativeEvent) {
            if (typeof nativeEvent.preventDefault === 'function') nativeEvent.preventDefault();
            if (typeof nativeEvent.stopPropagation === 'function') nativeEvent.stopPropagation();
            if (typeof nativeEvent.stopImmediatePropagation === 'function') nativeEvent.stopImmediatePropagation();
          }
        }
        
        // Toggle comments with a slight delay to ensure event prevention runs first
        // This is critical for preventing page reloads on first click
        setTimeout(() => {
          if (isClient) {
            setShowComments(prev => !prev);
          }
        }, 20);
      } catch (error) {
        console.error("Error in comment click handler:", error);
        // Still try to toggle comments if there was an error
        setTimeout(() => {
          if (isClient) {
            setShowComments(prev => !prev);
          }
        }, 20);
      }
      
      // Return false to prevent any possible form submission
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
      className="group/post space-y-3 p-5 mb-4 border border-border/60 rounded-lg shadow-sm bg-background transition-colors duration-200 hover:bg-muted/10"
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

      {/* Wrap action buttons in a div with preventDefault to ensure no form submissions */}
      <div 
        className="mt-4 flex items-center justify-between pt-2"
        onClick={(e) => {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
          return false;
        }}
      >
        <div 
          className="flex items-center gap-6"
          onClick={(e) => {
            if (typeof e.preventDefault === 'function') e.preventDefault();
            if (typeof e.stopPropagation === 'function') e.stopPropagation();
            return false;
          }}
        >
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
          <button
            type="button" // CRITICAL: Explicitly set type to button
            onClick={(e) => {
              if (typeof e.preventDefault === 'function') {
                e.preventDefault();
                if (typeof e.stopPropagation === 'function') {
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
              if (e.key === 'Enter' || e.key === ' ') {
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
      <div style={{ transition: 'none !important', animation: 'none !important' }}>
        {/* Only render comments when showComments is true to avoid unnecessary DOM elements */}
        {showComments && (
          <div 
            className="mt-2 border-t pt-4"
            style={{ 
              transition: 'none !important', 
              animation: 'none !important',
              opacity: 1
            }}
          >
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
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state on client side
  useEffect(() => {
    setIsMounted(true);
    // No need for initialization delay as our new click handler is more robust
    return () => {};
  }, []);

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
          
  // Query to get accurate comment count (useful when comments have been added since post was loaded)
  const { data: commentData } = useQuery({
    queryKey: ["comment-count", post.id],
    queryFn: async () => {
      const response = await fetch(`/api/v1/posts/${post.id}/comment-count`);
      if (!response.ok) return { count: commentCount };
      return response.json();
    },
    // Only refresh when component is in view
    refetchOnWindowFocus: false,
  });
  
  // Use the latest comment count from API if available, otherwise use the count from post data
  const totalComments = commentData?.count ?? commentCount;
          
  // Robust click handler to prevent page reloads on first click
  const handleClick = (e: React.MouseEvent) => {
    try {
      // Comprehensive event prevention at all levels
      if (e) {
        // First prevent default at event level
        if (typeof e.preventDefault === 'function') e.preventDefault();
        if (typeof e.stopPropagation === 'function') e.stopPropagation();
        
        // Also prevent at native event level
        if (e.nativeEvent) {
          if (typeof e.nativeEvent.preventDefault === 'function') e.nativeEvent.preventDefault();
          if (typeof e.nativeEvent.stopPropagation === 'function') e.nativeEvent.stopPropagation();
          if (typeof e.nativeEvent.stopImmediatePropagation === 'function') {
            e.nativeEvent.stopImmediatePropagation();
          }
        }
      }
      
      // Visual feedback
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 200);
      
      // Only call onClick if component is mounted, with a slight delay to ensure event prevention runs first
      if (isMounted && onClick) {
        setTimeout(() => {
          try {
            onClick(e);
          } catch (err) {
            // If the original event causes problems, try without it
            console.error('Error with event in CommentButton:', err);
            onClick(null);
          }
        }, 20);
      }
    } catch (error) {
      // Error handling with fallback
      console.error('Error in comment button click handler:', error);
      
      // Try to call onClick without an event if there was an error
      if (onClick) {
        setTimeout(() => onClick(null), 20);
      }
    }
    
    // Return false to prevent any form submission
    return false;
  };

  // Native button with type="button" to prevent form submission
  return (
    <button
      type="button" // CRITICAL: Explicitly set type to button to prevent form submission
      // Using only attributes that are compatible with type="button"
      formNoValidate={true}
      onClick={handleClick}
      onKeyDown={(e) => {
        // Handle keyboard accessibility
        if (e.key === 'Enter' || e.key === ' ') {
          if (typeof e.preventDefault === 'function') e.preventDefault();
          if (typeof e.stopPropagation === 'function') e.stopPropagation();
          if (onClick) onClick(e as unknown as React.MouseEvent);
        }
      }}
      onMouseDown={(e) => {
        // Also prevent default on mouse down if the methods exist
        if (typeof e.preventDefault === 'function') {
          e.preventDefault();
          if (typeof e.stopPropagation === 'function') {
            e.stopPropagation();
          }
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`-ml-2 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border-none bg-transparent px-3 text-xs ${isPressed ? "text-primary" : isHovered ? "text-primary/80" : "text-muted-foreground"} transition-colors duration-200 hover:bg-accent hover:text-accent-foreground`}
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
