"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Bookmark, Share2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ExtendedPost } from "./types";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PostCardProps {
  post: ExtendedPost;
}

export const PostCard = ({ post }: PostCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group/post space-y-3 border-b border-border/40 py-4 w-full max-w-2xl"
      layout
    >
      <div className="flex justify-between gap-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 ring-1 ring-offset-2 ring-primary/10">
            <AvatarImage src={post.organization.image ?? ''} />
            <AvatarFallback>{post.organization.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold hover:underline cursor-pointer">
              {post.organization.name}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="hover:text-primary transition-colors duration-200">
                {formatDistanceToNow(post.createdAt, { addSuffix: true })}
              </span>
              <span>•</span>
              <span className="flex items-center gap-0.5 hover:text-primary transition-colors duration-200">
                <Eye className="h-3 w-3" />
                {post._count.views || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="whitespace-pre-line break-words text-[15px] leading-relaxed text-foreground/90 py-2 px-1">
        {post.content}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/40">
        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <Heart className="h-4 w-4" />
            <span className="text-xs">{post._count.likes}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{post._count.comments}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.share?.({ 
                url: window.location.href,
                title: `Post by ${post.organization.name}`,
                text: post.content
              }).catch(() => {}); // Fallback silently if share is not supported
            }}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors duration-200"
          >
            <Share2 className="h-4 w-4" />
            <span className="text-xs">Share</span>
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-primary transition-colors duration-200"
        >
          <Bookmark className="h-4 w-4" />
        </Button>
      </div>
    </motion.article>
  );
};
