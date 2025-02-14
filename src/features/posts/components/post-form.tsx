"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { createPost } from "../services/post-service";
import type { Organization } from "@prisma/client";
import type { PostFormData } from "../types";

interface PostFormProps {
  organization: Organization;
  userId: string;
}

export function PostForm({ organization, userId }: PostFormProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <Card className="w-full max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Avatar className="size-10">
              <AvatarImage src={organization.image ?? ""} />
              <AvatarFallback>{organization.name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder={`What's on your mind? Posting as ${organization.name}`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-3">
          <span className="text-sm text-muted-foreground">
            {content.length}/500 characters
          </span>
          <Button
            type="submit"
            disabled={!content.trim() || isSubmitting}
            className="ml-auto"
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
