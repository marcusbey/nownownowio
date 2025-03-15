"use client";

import UserAvatar from "@/components/composite/UserAvatar";
import { ActionButton } from "@/components/core/action-button";
import { Button } from "@/components/core/button";
import { Card, CardContent } from "@/components/data-display/card";
import { Progress } from "@/components/feedback/progress";
import { useToast } from "@/components/feedback/use-toast";
import { EmojiPickerButton } from "@/features/social/posts/components/emoji-picker";
import RichTextEditor from "@/features/social/posts/components/rich-text-editor";
import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import type { PostsPage } from "@/lib/types";
import { useUploadThing } from "@/lib/uploadthing-client";
import { cn } from "@/lib/utils";
import type { InfiniteData } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { FilmIcon, ImagePlus, Loader2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useParams } from "next/navigation";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

// Extended type for UploadThing response
type UploadThingResponse = {
  url: string;
  mediaId: string;
  type: "IMAGE" | "VIDEO";
  // Include other properties from the standard response
  name: string;
  size: number;
  key: string;
};

// Type for post data
type PostFormData = {
  content: string;
  orgSlug: string | string[];
  mediaUrls?: string[];
  mediaIds?: string[];
};

type PostFormProps = {
  onSubmit?: () => void;
  organization?: {
    id: string;
    name: string;
  };
  userId?: string;
  userImage?: string | null;
  className?: string;
};

type MediaFile = {
  file: File;
  id?: string;
  previewUrl: string;
  type: "image" | "video";
  uploading: boolean;
  progress: number;
  error?: string;
};

export function PostForm({
  onSubmit,
  organization,
  userId,
  userImage,
  className,
}: PostFormProps) {
  // All hooks at the top
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { startUpload, isUploading } = useUploadThing("postMedia");
  const { orgSlug } = useParams();
  const [content, setContent] = useState("");
  const editorRef = React.useRef<{
    clearEditor: () => void;
    insertEmoji: (emoji: string) => void;
  }>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);

  // Define onDrop callback outside of any conditional blocks
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Check if adding these files would exceed the limit
      if (mediaFiles.length + acceptedFiles.length > 4) {
        toast({
          title: "Too many files",
          description: "You can only upload up to 4 files per post",
          variant: "destructive",
        });
        return;
      }

      // Process each file
      const newMediaFiles = acceptedFiles
        .map((file) => {
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");

          if (!isImage && !isVideo) {
            toast({
              title: "Unsupported file type",
              description: "Only images and videos are supported",
              variant: "destructive",
            });
            return null;
          }

          // Check file size
          const maxSize = isImage ? 4 * 1024 * 1024 : 64 * 1024 * 1024; // 4MB for images, 64MB for videos
          if (file.size > maxSize) {
            toast({
              title: "File too large",
              description: `${isImage ? "Images" : "Videos"} must be under ${isImage ? "4MB" : "64MB"}`,
              variant: "destructive",
            });
            return null;
          }

          return {
            file,
            previewUrl: URL.createObjectURL(file),
            type: isImage ? "image" : "video",
            uploading: false,
            progress: 0,
          } as MediaFile;
        })
        .filter(Boolean) as MediaFile[];

      setMediaFiles((prev) => [...prev, ...newMediaFiles]);
    },
    [mediaFiles.length, toast],
  );

  // Define dropzone hook outside of any conditional blocks
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
      "video/*": [".mp4", ".webm", ".mov"],
    },
    maxFiles: 4,
    multiple: true,
  });

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].previewUrl);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const validatePost = () => {
    try {
      if (!content.trim() && mediaFiles.length === 0) {
        return "Please enter some content or add media to your post";
      }

      if (content.length > 1000) {
        return "Post content is too long (maximum 1000 characters)";
      }

      return null;
    } catch (error) {
      return "Invalid post data";
    }
  };

  // Early returns after all hooks and function definitions
  if (status === "loading" && !userId) {
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

  // If userId was passed directly as a prop, use that instead of session
  const currentUser = userId ?? session?.user?.id;
  // Use userImage from props if available, otherwise from session
  const avatarUrl = userImage ?? session?.user?.image;

  if (!currentUser) {
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
      if (!orgSlug) {
        throw new Error("No organization slug provided");
      }

      // Create base post data
      let postData = {
        content: content.trim(),
        orgSlug,
      } as PostFormData;

      // Handle media files if present
      if (mediaFiles.length > 0) {
        // Mark all files as uploading
        setMediaFiles((prev) =>
          prev.map((file) => ({ ...file, uploading: true })),
        );

        // Upload files
        const filesToUpload = mediaFiles.map((mf) => mf.file);
        try {
          const uploadResult = await startUpload(filesToUpload, {
            onUploadProgress: (progress: number) => {
              // Update progress for all files
              setMediaFiles((prev) =>
                prev.map((file) => ({ ...file, progress })),
              );
            },
          });

          if (uploadResult) {
            console.log("Upload completed successfully:", uploadResult);

            // Extract URLs from the upload result with safer access
            const mediaUrls = uploadResult
              .map((file) => {
                try {
                  // Safely access properties with fallbacks
                  const url = file.url;
                  if (url) {
                    console.log(`Extracted URL for file ${file.name}: ${url}`);
                    return url;
                  }
                  return null;
                } catch (err) {
                  console.error("Error extracting URL from file:", err, file);
                  return null;
                }
              })
              .filter(Boolean); // Filter out any null values

            console.log("Extracted mediaUrls:", mediaUrls);

            // Extract media IDs if available
            const mediaIds = uploadResult
              .map((file) => {
                try {
                  // Access it using type assertion for custom response fields
                  const response = file as unknown as { mediaId?: string };
                  return response.mediaId ?? null;
                } catch (err) {
                  return null;
                }
              })
              .filter(Boolean);

            console.log("Extracted mediaIds:", mediaIds);

            // Add media data to post data
            if (mediaUrls.length > 0) {
              postData = { ...postData, mediaUrls: mediaUrls as string[] };
            }
            if (mediaIds.length > 0) {
              postData = { ...postData, mediaIds: mediaIds as string[] };
            }
          }
        } catch (error) {
          toast({
            title: "Error uploading media",
            description:
              error instanceof Error ? error.message : "Please try again later",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
      }

      // Submit post
      const response = await fetch(ENDPOINTS.POSTS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create post");
      }

      // Get the created post data
      let createdPost;
      try {
        const responseData = await response.json();
        // The API returns { post: { ... } } structure
        createdPost = responseData.post || responseData;
        
        // Log the response structure to debug
        console.log("Post creation response:", JSON.stringify(responseData, null, 2));
      } catch (error) {
        console.error("Error parsing response:", error);
        toast({
          title: "Post created",
          description: "Post was created but couldn't load the details",
        });
        return;
      }

      // Reset form
      setContent("");
      editorRef.current?.clearEditor();
      setMediaFiles((prev) => {
        prev.forEach((file) => URL.revokeObjectURL(file.previewUrl));
        return [];
      });

      // Ensure the created post has complete user data before updating the cache
      const currentUserData = session?.user;
      
      // Enhance the createdPost with complete user data if it's missing
      const enhancedPost = {
        ...createdPost,
        user: createdPost.user && Object.keys(createdPost.user).length > 0 
          ? {
              ...createdPost.user,
              // Ensure all required user fields are present
              id: createdPost.user.id || currentUser,
              name: createdPost.user.name || currentUserData?.name || session?.user?.name || "unknown",
              displayName: createdPost.user.displayName || currentUserData?.name || session?.user?.name || "Unknown User",
              image: createdPost.user.image || avatarUrl || currentUserData?.image || "",
              email: createdPost.user.email || currentUserData?.email || session?.user?.email || ""
            }
          : {
              id: currentUser,
              name: currentUserData?.name || session?.user?.name || "unknown",
              image: avatarUrl || currentUserData?.image || "",
              displayName: currentUserData?.name || session?.user?.name || "Unknown User",
              email: currentUserData?.email || session?.user?.email || ""
            },
        _count: createdPost._count || { likes: 0, comments: 0 },
        likes: createdPost.likes || [],
        comments: createdPost.comments || [],
      };
      
      // Log the enhanced post to verify user data is complete
      console.log("Enhanced post with user data:", JSON.stringify({
        id: enhancedPost.id,
        user: enhancedPost.user,
        _count: enhancedPost._count
      }, null, 2));
      
      // Update the cache directly with the enhanced post
      const queryFilter = {
        queryKey: ["post-feed", "for-you"],
        exact: true,
      };

      // Cancel any in-flight queries
      await queryClient.cancelQueries(queryFilter);

      // Update the cache to add the new post at the beginning
      try {
        queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
          queryFilter,
          (oldData) => {
            if (!oldData?.pages || oldData.pages.length === 0) {
              // If there's no existing data, create a new structure
              return {
                pages: [{ posts: [enhancedPost], nextCursor: null }],
                pageParams: [null],
              };
            }

            // Add the new post to the beginning of the first page
            const newPages = [...oldData.pages];
            newPages[0] = {
              ...newPages[0],
              posts: [enhancedPost, ...(newPages[0]?.posts || [])],
            };

            return {
              ...oldData,
              pages: newPages,
            };
          },
        );
        
        // Also update the following feed if it exists
        const followingQueryFilter = {
          queryKey: ["post-feed", "following"],
          exact: true,
        };
        
        queryClient.setQueriesData<InfiniteData<PostsPage, string | null>>(
          followingQueryFilter,
          (oldData) => {
            if (!oldData?.pages || oldData.pages.length === 0) return oldData;
            
            // Add the new post to the beginning of the first page
            const newPages = [...oldData.pages];
            newPages[0] = {
              ...newPages[0],
              posts: [enhancedPost, ...(newPages[0]?.posts || [])],
            };
            
            return {
              ...oldData,
              pages: newPages,
            };
          },
        );
      } catch (error) {
        console.error("Error updating cache:", error);
        // If cache update fails, invalidate the query to force a refetch
        void queryClient.invalidateQueries(queryFilter);
      }

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

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex gap-4">
        <div className="shrink-0">
          <UserAvatar
            avatarUrl={avatarUrl}
            size={44}
            className="ring-2 ring-background"
          />
        </div>
        <div className="relative flex-1 space-y-3">
          <RichTextEditor
            onChange={setContent}
            ref={editorRef}
            onMediaSelect={(files) => {
              // Process the files selected from the rich text editor
              onDrop(files);
            }}
          />

          {/* Media Preview Section */}
          {mediaFiles.length > 0 && (
            <div
              className={cn(
                "grid gap-2",
                mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2",
              )}
            >
              {mediaFiles.map((media, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-md bg-muted/50"
                  style={{
                    aspectRatio: media.type === "image" ? "16/9" : "16/9",
                  }}
                >
                  {media.type === "image" ? (
                    <Image
                      src={media.previewUrl}
                      alt="Media preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="relative size-full">
                      <video
                        src={media.previewUrl}
                        className="size-full object-cover"
                        controls={!media.uploading}
                      />
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <FilmIcon className="size-8 text-white opacity-70" />
                      </div>
                    </div>
                  )}

                  {/* Upload Progress Indicator */}
                  {media.uploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
                      <Loader2 className="mb-2 size-8 animate-spin text-primary" />
                      <Progress value={media.progress} className="h-2 w-3/4" />
                      <span className="mt-1 text-xs">
                        {Math.round(media.progress)}%
                      </span>
                    </div>
                  )}

                  {/* Remove Button */}
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute right-2 top-2 size-7 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeMedia(index)}
                    type="button"
                    disabled={isSubmitting || media.uploading}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Removed always-visible dropzone area in favor of the Media option in the rich text editor */}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <EmojiPickerButton
                onEmojiSelect={(emoji) => {
                  editorRef.current?.insertEmoji(emoji);
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-9 px-2 text-muted-foreground hover:text-foreground"
                onClick={() => document.getElementById("media-upload")?.click()}
                disabled={isSubmitting || isUploading || mediaFiles.length >= 4}
              >
                <ImagePlus className="size-5" />
              </Button>
            </div>

            <ActionButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={
                isSubmitting ||
                isUploading ||
                mediaFiles.some((m) => m.uploading)
              }
              className={cn(
                "px-5 h-9",
                (isSubmitting || isUploading) && "cursor-not-allowed",
              )}
            >
              {isSubmitting || isUploading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                "Post"
              )}
            </ActionButton>
          </div>
        </div>
      </div>

      <input
        type="file"
        id="media-upload"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            onDrop(Array.from(e.target.files));
            e.target.value = ""; // Reset input
          }
        }}
        disabled={isSubmitting || isUploading || mediaFiles.length >= 4}
      />
    </form>
  );
}
