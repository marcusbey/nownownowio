"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardFooter } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import UserAvatar from "../UserAvatar";
import { useToast } from "../ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useParams } from "next/navigation";

interface PostFormProps {
  onSubmit?: () => void;
}

export function PostForm({ onSubmit }: PostFormProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { startUpload, isUploading } = useUploadThing("postMedia");

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
    
    setSelectedImages(prev => [...prev, ...files]);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const { orgSlug } = useParams();

  const validatePost = () => {
    try {
      if (!content.trim() && !title.trim()) {
        return "Please enter some content for your post";
      }

      if (content.length > 1000) {
        return "Post content is too long (maximum 1000 characters)";
      }

      if (title && title.length > 100) {
        return "Title is too long (maximum 100 characters)";
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
      console.log('[FORM_DEBUG] Using org slug:', orgSlug);
      if (!orgSlug) {
        throw new Error('No organization slug provided');
      }
      
      let mediaUrls: string[] = [];
      if (selectedImages.length > 0) {
        const uploadResult = await startUpload(selectedImages);
        if (uploadResult) {
          mediaUrls = uploadResult.map(file => file.url);
        }
      }

      // Ensure we have either title or content
      if (!content.trim() && !title.trim()) {
        throw new Error("Please enter some content for your post");
      }

      const postData = {
        title: title.trim() || undefined,
        content: content.trim() || " ", // Ensure content is never empty
        mediaUrls,
        orgSlug,
      };

      console.log('[FORM_DEBUG] Creating post with data:', postData);
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      setTitle("");
      setContent("");
      setSelectedImages([]);
      setPreviewUrls(prev => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
      
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
      toast({ title: "Post created successfully" });
      onSubmit?.();
    } catch (error) {
      toast({
        title: "Error creating post",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user) return null;

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex gap-4">
        <UserAvatar 
          avatarUrl={session.user.image}
          size={44}
          className="shrink-0"
        />
        <div className="flex-1 space-y-3">
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="border-none bg-muted/40 px-4 h-11 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 rounded-lg"
          />
          <Textarea
            placeholder="What's on your mind?"
            value={content}
            onChange={e => setContent(e.target.value)}
            className="min-h-[120px] resize-none border-none bg-muted/40 px-4 py-3 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 rounded-lg"
          />
          
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {previewUrls.map((url, index) => (
                <div key={url} className="relative group aspect-video bg-muted/50 rounded-md overflow-hidden">
                  <Image
                    src={url}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center pt-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground h-9 px-2"
              onClick={() => document.getElementById("image-upload")?.click()}
              disabled={isSubmitting || isUploading}
            >
              <ImagePlus className="h-5 w-5" />
            </Button>
            
            <Button
              type="submit"
              variant="default"
              size="sm"
              disabled={isSubmitting || isUploading}
              className={cn(
                "px-5 h-9 rounded-full font-medium",
                (isSubmitting || isUploading) && "cursor-not-allowed"
              )}
            >
              {isSubmitting || isUploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
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
  