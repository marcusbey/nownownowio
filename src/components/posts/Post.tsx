"use client";

import { PostData } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";
import { Media } from "@prisma/client";
import { Eye, MessageSquare, Share2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Comments from "../comments/Comments";
import Linkify from "../Linkify";
import UserAvatar from "../UserAvatar";
import UserTooltip from "../UserTooltip";
import BookmarkButton from "./BookmarkButton";
import LikeButton from "./LikeButton";
import PostMoreButton from "./PostMoreButton";
import { motion } from "framer-motion";

interface PostProps {
  post: PostData;
}

export default function Post({ post }: PostProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [showComments, setShowComments] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const userProfileLink =
    user && post.user.id === user.id
      ? `/orgs/${post.user.organizations?.[0]?.organization?.slug || ""}/profile`
      : `/users/${post.user.name}`;

  return (
    <motion.article 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group/post space-y-4 rounded-xl bg-card p-6 shadow-sm hover:shadow-md transition-all duration-200"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
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
          <MediaPreviews attachments={post.attachments} />
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
            onClick={() => setShowComments(!showComments)}
          />
          <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200">
            <Share2 className="h-5 w-5" />
            <span className="text-sm font-medium">Share</span>
          </button>
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
          <Comments post={post} />
        </motion.div>
      )}
    </motion.article>
  );
}

interface MediaPreviewsProps {
  attachments: Media[];
}

function MediaPreviews({ attachments }: MediaPreviewsProps) {
  const gridClassName = cn(
    "grid gap-2",
    {
      "grid-cols-1": attachments.length === 1,
      "grid-cols-2": attachments.length === 2,
      "grid-cols-2 grid-rows-2": attachments.length >= 3,
    }
  );

  return (
    <div className={gridClassName}>
      {attachments.slice(0, 4).map((media) => (
        <MediaPreview key={media.id} media={media} />
      ))}
    </div>
  );
}

interface MediaPreviewProps {
  media: Media;
}

function MediaPreview({ media }: MediaPreviewProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <Image
        src={media.url}
        alt=""
        fill
        className="object-cover transition-transform duration-200 hover:scale-105"
      />
    </div>
  );
}

interface CommentButtonProps {
  post: PostData;
  onClick: () => void;
}

function CommentButton({ post, onClick }: CommentButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
    >
      <MessageSquare className="h-5 w-5" />
      <span className="text-sm font-medium">{post._count.comments}</span>
    </button>
  );
}
