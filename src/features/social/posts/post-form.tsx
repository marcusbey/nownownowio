"use client";

import UserAvatar from "@/components/composite/UserAvatar";
import { Button } from "@/components/core/button";
import { ActionButton } from "@/components/core/action-button";
import { Card, CardContent } from "@/components/data-display/card";
import { useToast } from "@/components/feedback/use-toast";
import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useState } from "react";
import RichTextEditor from "@/features/social/posts/components/rich-text-editor";
import { CommandMenu } from "@/features/social/posts/components/command-menu";

type PostFormProps = {
  onSubmit?: () => void;
  organization?: {
    id: string;
    name: string;
  };
  userId?: string;
  className?: string;
};

export function PostForm({
  onSubmit,
  organization,
  userId,
  className,
}: PostFormProps) {
  // All hooks at the top
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { startUpload, isUploading } = useUploadThing("postMedia");
  const { orgSlug } = useParams();
  const [content, setContent] = useState("");
  const editorRef = React.useRef<{ clearEditor: () => void }>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Early returns after all hooks
  if (status === "loading") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="size-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="text-center text-muted-foreground">
            Please log in to create posts.
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 4) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 4 images per post",
        variant: "destructive",
      });
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const validatePost = () => {
    try {
      if (!content.trim()) {
        return "Please enter some content for your post";
      }

      if (content.length > 1000) {
        return "Post content is too long (maximum 1000 characters)";
      }

      return null;
    } catch (error) {
      return "Invalid post data";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validatePost();
    if (validationError) {
      toast({
        title: "Validation Error",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate organization slug
      console.log("[FORM_DEBUG] Using org slug:", orgSlug);
      if (!orgSlug) {
        throw new Error("No organization slug provided");
      }

      let mediaUrls: string[] = [];
      if (selectedImages.length > 0) {
        const uploadResult = await startUpload(selectedImages);
        if (uploadResult) {
          mediaUrls = uploadResult.map((file) => file.url);
        }
      }

      // Ensure we have content
      if (!content.trim()) {
        throw new Error("Please enter some content for your post");
      }

      const postData = {
        content: content.trim(),
        mediaUrls,
        orgSlug,
      };

      console.log("[FORM_DEBUG] Creating post with data:", postData);
      const response = await fetch(ENDPOINTS.POSTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      setContent("");
      editorRef.current?.clearEditor();
      setSelectedImages([]);
      setPreviewUrls((prev) => {
        prev.forEach((url) => URL.revokeObjectURL(url));
        return [];
      });

      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
      toast({ title: "Post created successfully" });
      onSubmit?.();
    } catch (error) {
      toast({
        title: "Error creating post",
        description:
          error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session.user) return null;

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex gap-4">
        <UserAvatar
          avatarUrl={session.user.image}
          size={44}
          className="shrink-0"
        />
        <div className="relative flex-1 space-y-3">
          <RichTextEditor onChange={setContent} ref={editorRef} />

          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previewUrls.map((url, index) => (
                <div
                  key={url}
                  className="group relative aspect-video overflow-hidden rounded-md bg-muted/50"
                >
                  <Image
                    src={url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-muted-foreground hover:text-foreground"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={isSubmitting || isUploading}
            >
              <ImagePlus className="size-5" />
            </Button>

            <ActionButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={isSubmitting || isUploading}
              className={cn(
                "px-5 h-9 rounded-full",
                (isSubmitting || isUploading) && "cursor-not-allowed",
              )}
            >
              {isSubmitting || isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Post"
              )}
            </Button>
          </div>
        </div>
      </div>

      <input
        type="file"
        id="image-upload"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleImageSelect}
        disabled={isSubmitting || isUploading}
      />
    </form>
  );
}
