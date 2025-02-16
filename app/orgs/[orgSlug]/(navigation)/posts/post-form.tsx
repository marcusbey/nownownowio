"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, FileImage, Laugh, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { createPost } from "./services/post-service";
import type { Organization } from "@prisma/client";
import { motion, AnimatePresence } from "framer-motion";

interface PostFormProps {
  organization: Organization;
  userId: string;
}

const MAX_CHARS = 280;

export function PostForm({ organization, userId }: PostFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [charCount, setCharCount] = useState(0);
  const router = useRouter();

  const handleContentChange = (value: string) => {
    setContent(value);
    setCharCount(value.length);
  };

  const handleSubmit = async () => {
    if (!content.trim() && attachments.length === 0) return;
    if (charCount > MAX_CHARS) return;

    setIsSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        userId,
        organization: {
          id: organization.id,
          slug: organization.slug,
        },
        // TODO: Handle attachments upload
      });

      setContent("");
      setAttachments([]);
      toast.success("Your post has been published successfully.");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-card p-6 shadow-sm mb-6"
    >
      <div className="flex gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-offset-2 ring-primary/10">
          <AvatarImage src={organization?.image ?? undefined} />
          <AvatarFallback>
            {organization?.name ? organization.name[0] : "O"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={`What's on your mind? Posting as ${organization?.name ?? 'your organization'}`}
            className="min-h-[100px] resize-none border-none bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0"
          />
          
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-2"
              >
                {/* Attachment previews will be implemented here */}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full text-primary hover:bg-primary/10"
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
                  <span className={charCount > MAX_CHARS ? "text-destructive" : ""}>
                    {charCount}
                  </span>
                  /{MAX_CHARS}
                </div>
              )}
            </div>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (!content.trim() && !attachments.length) || charCount > MAX_CHARS}
              className="rounded-full px-6"
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
