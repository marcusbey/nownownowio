"use client";

import { createComment } from "@/lib/api/comments";
import { PostData } from "@/lib/types";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, FileImage, Laugh, Send } from "lucide-react";
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
      toast({
        description: "Comment added successfully",
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
      className="flex gap-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <UserAvatar 
        avatarUrl={session.user.image} 
        className="h-8 w-8 ring-1 ring-offset-2 ring-primary/10" 
      />
      
      <div className="flex-1 space-y-2">
        <Textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[60px] resize-none rounded-xl border-none bg-muted px-4 py-3 text-sm focus-visible:ring-1 focus-visible:ring-ring"
        />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
            >
              <FileImage className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
            >
              <Camera className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
            >
              <Laugh className="h-4 w-4" />
            </Button>
          </div>

          <Button
            size="sm"
            className="rounded-full px-4"
            disabled={!content.trim() || isSubmitting}
            onClick={handleSubmit}
          >
            <Send className="mr-2 h-3 w-3" />
            Reply
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
