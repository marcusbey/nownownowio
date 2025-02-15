"use client";

import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { Eye, MessageSquare, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect, useMemo } from "react";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import { Button } from "../ui/button";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";
import { usePostViews } from "@/hooks/use-post-views";

const LazyMediaPreviews = lazy(() => import('./MediaPreview').then(mod => ({ default: mod.MediaPreviews })));
const Comments = lazy(() => import('../comments/Comments'));

interface PostProps {
  post: PostData;
}

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

  const handleCommentClick = useCallback((e: React.MouseEvent) => {
    if (!isClient) return;
    e.preventDefault();
    e.stopPropagation();
    setShowComments((prev) => !prev);
  }, [isClient]);

  const userProfileLink = useMemo(() => 
    user && post.user.id === user.id
      ? `/orgs/${post.user.organizations?.[0]?.organization?.slug || ""}/profile`
      : `/users/${post.user.name}`,
    [user, post.user]
  );

  const isOwnPost = useMemo(() => user && post.user.id === user.id, [user, post.user.id]);
  const displayName = useMemo(() => post.user.displayName || post.user.name, [post.user]);
  const hasAttachments = post.attachments?.length > 0;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group/post space-y-3 border-b border-border/40 py-4 transition-all duration-200"
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
                className="h-10 w-10 ring-1 ring-offset-2 ring-primary/10 hover:ring-primary/30 transition-all duration-200"
              />
            </Link>
          </UserTooltip>
          <div className="flex flex-col">
            <UserTooltip user={post.user}>
              <Link
                href={userProfileLink}
                className="font-semibold hover:underline decoration-primary/30"
              >
                {displayName}
              </Link>
            </UserTooltip>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link
                href={`/posts/${post.id}`}
                className="hover:text-primary transition-colors duration-200"
                suppressHydrationWarning
              >
                {formatRelativeDate(post.createdAt)}
              </Link>
              <span>•</span>
              <span className="flex items-center gap-0.5 hover:text-primary transition-colors duration-200">
                <Eye className="h-3 w-3" />
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
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />
        )}
      </div>

      <Linkify>
        <div className="whitespace-pre-line break-words text-[15px] leading-relaxed text-foreground/90 py-2 px-1">
          {post.content}
        </div>
      </Linkify>

      {hasAttachments && (
        <div className="rounded-lg overflow-hidden mt-2">
          <Suspense fallback={<div className="h-48 animate-pulse bg-muted rounded-lg" />}>
            <LazyMediaPreviews attachments={post.attachments} />
          </Suspense>
        </div>
      )}

      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/40">
        <div className="flex items-center gap-6">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes?.some(
                (like) => like.userId === user?.id,
              ) || false,
            }}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200"
          />
          <CommentButton
            post={post}
            onClick={handleCommentClick}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              navigator.share?.({ 
                url: `${window.location.origin}/posts/${post.id}`,
                title: `Post by ${post.user.displayName || post.user.name}`,
                text: post.content
              }).catch(() => {}); // Fallback silently if share is not supported
            }}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200 -ml-2"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs">Share</span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            {(viewCount || 0) + 1}
          </span>
          <BookmarkButton
            postId={post.id}
            initialState={{
              isBookmarkedByUser: post.bookmarks?.some(
                (bookmark) => bookmark.userId === user?.id,
              ) || false,
            }}
            className="text-muted-foreground hover:text-primary transition-colors duration-200"
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
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted rounded-lg" />}>
            <Comments post={post} />
          </Suspense>
        </motion.div>
      )}
    </motion.article>
  );
}

interface CommentButtonProps {
  post: PostData;
  onClick: (e: React.MouseEvent) => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200 -ml-2"
    >
      <MessageSquare className="h-4 w-4" />
      <span className="text-xs">{post._count.comments}</span>
    </Button>
  );
}
