"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { createPost } from "@/lib/api/posts";
import { useQueryClient } from "@tanstack/react-query";
import { Camera, FileImage, Laugh, PlusCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import UserAvatar from "../UserAvatar";
import { motion, AnimatePresence } from "framer-motion";

export default function PostComposer() {
  const { data: session } = useSession();
  const params = useParams();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [charCount, setCharCount] = useState(0);
  const maxChars = 280;

  if (!session?.user) return null;

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;
    if (charCount > maxChars) return;

    setIsSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        orgSlug: params.orgSlug as string,
        // Handle attachments upload here
      });

      setContent("");
      setAttachments([]);
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast({
        title: "Post created!",
        description: "Your post has been published successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    setCharCount(value.length);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border-b border-border/40 pb-4 mb-6"
    >
      <div className="flex gap-4">
        <UserAvatar 
          avatarUrl={session.user.image} 
          className="h-10 w-10 ring-1 ring-offset-2 ring-primary/10" 
        />
        <div className="flex-1 space-y-4">
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="min-h-[80px] resize-none border-none bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 p-0"
          />
          
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-2 rounded-lg border border-border/40 p-2"
              >
                {/* Attachment previews would go here */}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
              >
                <FileImage className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-primary hover:bg-primary/10"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-primary hover:bg-primary/10"
              >
                <PlusCircle className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-primary hover:bg-primary/10"
              >
                <Laugh className="h-5 w-5" />
              </Button>
              {charCount > 0 && (
                <div className="ml-2 text-sm text-muted-foreground">
                  <span className={charCount > maxChars ? "text-destructive" : ""}>
                    {charCount}
                  </span>
                  /{maxChars}
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !content.trim() || charCount > maxChars}
              className="rounded-full px-6"
            >
              Post
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
