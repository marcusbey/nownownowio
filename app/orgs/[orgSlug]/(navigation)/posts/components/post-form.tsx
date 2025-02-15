"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ImageIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";
import { createPost } from "../services/post-service";
import type { Organization } from "@prisma/client";

interface PostFormProps {
  organization: Organization;
  userId: string;
}

export function PostForm({ organization, userId }: PostFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        userId,
        organizationId: organization.id,
      });

      setContent("");
      toast.success("Your post has been published successfully.");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-border/40 pb-4 mb-6">
      <div className="flex gap-4">
        <Avatar className="h-10 w-10 ring-1 ring-offset-2 ring-primary/10">
          <AvatarImage src={organization?.image ?? undefined} />
          <AvatarFallback>
            {organization?.name ? organization.name[0] : "O"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={`What's on your mind? Posting as ${organization?.name ?? 'your organization'}`}
            className="min-h-[80px] resize-none border-none bg-transparent text-lg placeholder:text-muted-foreground/60 focus-visible:ring-0 p-0"
          />
          <div className="flex items-center justify-between border-t border-border/40 pt-3">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 rounded-full text-primary hover:bg-primary/10"
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                {content.length}/500
              </span>
              <Button
                onClick={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className="px-6"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
