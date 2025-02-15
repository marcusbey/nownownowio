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
    <div className="flex gap-4 py-4 px-4">
      <Avatar className="h-10 w-10">
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
          className="min-h-[100px] resize-none border-none bg-transparent p-0 focus-visible:ring-0"
        />
        <div className="flex justify-between items-center">
          <Button variant="outline" size="icon" className="rounded-full">
            <ImageIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {content.length}/500
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || isSubmitting}
            >
              {isSubmitting ? "Posting..." : "Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
