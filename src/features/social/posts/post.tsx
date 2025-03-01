"use client";

import UserAvatar from "@/components/composite/UserAvatar";
import UserTooltip from "@/components/composite/UserTooltip";
import { Button } from "@/components/core/button";
import Linkify from "@/components/data-display/Linkify";
import { usePostViews } from "@/hooks/use-post-views";
import type { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
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
import { BookmarkButton, LikeButton, PostMoreButton } from "./post-actions";

const LazyMediaPreviews = lazy(async () =>
  import("../components/media-preview").then((mod) => ({
    default: mod.MediaPreviews,
  })),
);
const Comments = lazy(async () =>
  import("@/components/composite/comments/Comments").then((mod) => ({
    default: mod.Comments,
  })),
);

type PostProps = {
  post: PostData;
};

export default function Post({ post }: PostProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { viewCount } = usePostViews(post.id);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCommentClick = useCallback(
    (e: React.MouseEvent) => {
      if (!isClient) return;
      e.preventDefault();
      e.stopPropagation();
      setShowComments((prev) => !prev);
    },
    [isClient],
  );

  const userProfileLink = useMemo(() => {
    if (user && post.user.id === user.id) {
      const userOrgs = post.user.organizations ?? [];
      const orgSlug =
        userOrgs.length > 0 ? userOrgs[0].organization?.slug : undefined;

      return `/orgs/${orgSlug || ""}/profile`;
    }
    return `/users/${post.user.name || ""}`;
  }, [user, post.user]);

  const isOwnPost = useMemo(
    () => user && post.user.id === user.id,
    [user, post.user.id],
  );
  const displayName = useMemo(
    () => post.user.displayName || post.user.name,
    [post.user],
  );
  const attachments = post.attachments ?? [];
  const hasAttachments = attachments.length > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group/post space-y-3 p-4 hover:bg-muted/20 transition-colors duration-200"
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
                {(viewCount || 0) + 1}
              </span>
            </div>
          </div>
        </div>
        {isOwnPost && (
          <PostMoreButton
            post={post}
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
            <LazyMediaPreviews attachments={attachments} />
          </Suspense>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between pt-2">
        <div className="flex items-center gap-6">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser:
                post.likes.some((like) => like.userId === user?.id) || false,
            }}
            className="flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-primary"
          />
          <CommentButton post={post} onClick={handleCommentClick} />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              navigator
                .share({
                  url: `${window.location.origin}/posts/${post.id}`,
                  title: `Post by ${post.user.displayName || post.user.name}`,
                  text: post.content,
                })
                .catch(() => {}); // Fallback silently if share is not supported
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
            {(viewCount || 0) + 1}
          </span>
          <BookmarkButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser:
                post.bookmarks.some(
                  (bookmark) => bookmark.userId === user?.id,
                ) || false,
            }}
            className="text-muted-foreground transition-colors duration-200 hover:text-primary"
          />
        </div>
      </div>

      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          layout
        >
          <Suspense
            fallback={
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
            }
          >
            <Comments post={post} />
          </Suspense>
        </motion.div>
      )}
    </motion.article>
  );
}

type CommentButtonProps = {
  post: PostData;
  onClick: (e: React.MouseEvent) => void;
};

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="-ml-2 flex items-center gap-1.5 text-muted-foreground transition-colors duration-200 hover:text-primary"
    >
      <MessageSquare className="size-4" />
      <span className="text-xs">{post._count.comments}</span>
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
      return fetch("/api/posts").then(async (res) => res.json());
    },
  });

  if (isLoading) return <div>Loading feed...</div>;

  return (
    <div>{feedData?.map((post) => <p key={post.id}>{post.content}</p>)}</div>
  );
}
