"use client";

import UserAvatar from "@/components/composite/UserAvatar";
import { Button } from "@/components/core/button";
import { Textarea } from "@/components/core/textarea";
import { useToast } from "@/components/feedback/use-toast";
import { createComment } from "@/lib/api/comments";
import type { PostData } from "@/lib/types";
import { extractUserFromSession } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";

type CommentInputProps = {
  post: PostData;
};

export default function CommentInput({ post }: CommentInputProps) {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Set client-side rendering flag to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // To prevent hydration mismatch and ensure session is fully loaded
  if (!isClient || status === "loading") {
    return (
      <motion.div
        className="flex gap-2 pl-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <UserAvatar
          avatarUrl={null}
          size={32}
          className="shrink-0 ring-1 ring-primary/10 ring-offset-1"
        />
        <div className="relative flex-1">
          <div className="animate-pulse rounded-xl bg-muted/50 px-4 py-2.5 text-sm">
            Loading...
          </div>
        </div>
      </motion.div>
    );
  }

  // Use the utility function to extract user data
  const userInfo = extractUserFromSession(session, status);

  // Show sign-in prompt if not authenticated or if session has no user data
  if (status !== "authenticated" || !userInfo) {
    return (
      <motion.div
        className="mb-4 flex items-start gap-3 px-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <UserAvatar
          avatarUrl={null}
          size={32}
          className="mt-1 shrink-0 opacity-70 ring-1 ring-primary/10 ring-offset-1"
        />
        <div className="relative flex-1">
          <Link
            href="/auth/signin"
            className="flex items-center justify-center gap-2 rounded-2xl bg-muted/30 px-5 py-3 text-sm font-medium text-primary/90 backdrop-blur-sm transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:shadow-sm"
          >
            <svg
              className="mr-1 size-4"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            Sign in to comment
          </Link>
        </div>
      </motion.div>
    );
  }

  const handleSubmit = async () => {
    if (!content.trim()) return;

    // Make sure we have user info before submitting
    if (!userInfo) {
      toast({
        title: "Error",
        description: "Unable to identify user. Please try signing in again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createComment({
        postId: post.id,
        content: content.trim(),
      });

      setContent("");
      await queryClient.invalidateQueries({
        queryKey: ["comments", post.id],
      });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
    }
  };

  return (
    <motion.div
      className="mb-4 flex items-start gap-3 px-1"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      <UserAvatar
        avatarUrl={userInfo?.image ?? null}
        size={32}
        className="mt-1 shrink-0 shadow-sm ring-1 ring-primary/20 ring-offset-1 transition-all duration-200 hover:ring-primary/40"
      />

      <div className="relative flex-1 overflow-hidden rounded-2xl bg-muted/30 backdrop-blur-sm transition-all duration-200 focus-within:bg-background focus-within:shadow-sm hover:bg-muted/40">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoFocus
          className={`min-h-[48px] max-h-[120px] resize-none border-none bg-transparent px-4 py-3 text-sm ${isFocused ? "ring-0" : "ring-0"} pr-12 transition-all duration-200 placeholder:text-muted-foreground/70 focus-visible:ring-0`}
        />
        <Button
          size="icon"
          variant={content.trim() ? "default" : "ghost"}
          className={`absolute right-2 top-1/2 size-8 -translate-y-1/2 rounded-full ${content.trim() ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground/70 hover:text-muted-foreground"} transition-all duration-200 hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-50`}
          disabled={!content.trim() || isSubmitting}
          onClick={handleSubmit}
          aria-label="Submit comment"
        >
          {isSubmitting ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </motion.div>
  );
}
