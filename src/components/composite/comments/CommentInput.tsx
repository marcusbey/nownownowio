"use client";

import { createComment } from "@/lib/api/comments";
import { PostData } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useToast } from "../ui/use-toast";
import UserAvatar from "../UserAvatar";
import { motion } from "framer-motion";

interface CommentInputProps {
  post: PostData;
}

export default function CommentInput({ post }: CommentInputProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session?.user) {
    return null;
  }

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createComment({
        postId: post.id,
        content: content.trim(),
      });

      setContent("");
      queryClient.invalidateQueries({
        queryKey: ["comments", post.id],
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
      handleSubmit();
    }
  };

  return (
    <motion.div 
      className="flex gap-3 pl-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <UserAvatar 
        avatarUrl={session.user.image} 
        className="h-8 w-8 flex-shrink-0" 
      />
      
      <div className="relative flex-1">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[44px] resize-none rounded-xl border-none bg-muted/50 pr-12 text-sm focus-visible:ring-1 focus-visible:ring-primary"
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:pointer-events-none disabled:opacity-50"
          disabled={!content.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}
