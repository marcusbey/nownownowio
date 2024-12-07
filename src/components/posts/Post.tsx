"use client";

import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { Eye, MessageSquare, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import { Button } from "../ui/button";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import { motion } from "framer-motion";
import { lazy, Suspense } from "react";

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

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCommentClick = useCallback((e: React.MouseEvent) => {
    if (!isClient) return;
    e.preventDefault();
    e.stopPropagation();
    setShowComments((prev) => !prev);
  }, [isClient]);

  const userProfileLink =
    user && post.user.id === user.id
      ? `/orgs/${post.user.organizations?.[0]?.organization?.slug || ""}/profile`
      : `/users/${post.user.name}`;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group/post space-y-4 rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
      onHoverStart={() => isClient && setIsHovered(true)}
      onHoverEnd={() => isClient && setIsHovered(false)}
      suppressHydrationWarning
    >
      <div className="flex justify-between gap-4">
        <div className="flex items-start gap-4">
          <UserTooltip user={post.user}>
            <Link href={userProfileLink} className="shrink-0">
              <UserAvatar 
                avatarUrl={post.user.image} 
                className="h-12 w-12 ring-2 ring-offset-2 ring-primary/10 hover:ring-primary/30 transition-all duration-200" 
              />
            </Link>
          </UserTooltip>
          <div className="flex flex-col">
            <UserTooltip user={post.user}>
              <Link
                href={userProfileLink}
                className="font-semibold text-lg hover:underline decoration-primary/30"
              >
                {post.user.displayName || post.user.name}
              </Link>
            </UserTooltip>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link
                href={`/posts/${post.id}`}
                className="hover:text-primary transition-colors duration-200"
                suppressHydrationWarning
              >
                {formatRelativeDate(post.createdAt)}
              </Link>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {Math.floor(Math.random() * 1000)}
              </span>
            </div>
          </div>
        </div>
        {user && post.user.id === user.id && (
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
        <div className="whitespace-pre-line break-words text-base leading-relaxed">
          {post.content}
        </div>
      </Linkify>

      {!!post.attachments.length && (
        <div className="rounded-xl overflow-hidden">
          <Suspense fallback={<div className="h-48 animate-pulse bg-muted" />}>
            <LazyMediaPreviews attachments={post.attachments} />
          </Suspense>
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-6">
          <LikeButton
            postId={post.id}
            initialState={{
              likes: post._count.likes,
              isLikedByUser: post.likes.some(
                (like) => like.userId === user?.id,
              ),
            }}
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
              // TODO: Implement share functionality
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-primary"
          >
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">Share</span>
          </Button>
        </div>
        <BookmarkButton
          postId={post.id}
          initialState={{
            isBookmarkedByUser: post.bookmarks.some(
              (bookmark) => bookmark.userId === user?.id,
            ),
          }}
        />
      </div>

      {showComments && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Suspense fallback={<div className="h-24 animate-pulse bg-muted" />}>
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
      className="flex items-center gap-2 text-muted-foreground hover:text-primary"
    >
      <MessageSquare className="h-5 w-5" />
      <span className="text-sm font-medium">{post._count.comments}</span>
    </Button>
  );
}
