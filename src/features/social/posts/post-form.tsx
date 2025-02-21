"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/core/button";
import { Card, CardContent, CardFooter } from "@/components/data-display/card";
import { Textarea } from "@/components/core/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/composite/UserAvatar";
import { useToast } from "@/components/feedback/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useParams } from "next/navigation";
import { ENDPOINTS } from "@/lib/api/apiEndpoints";
import { CommandMenu, FormatCommand, formatCommands } from "./components/command-menu";

interface PostFormProps {
  onSubmit?: () => void;
  organization?: {
    id: string;
    name: string;
  };
  userId?: string;
  className?: string;
}

export function PostForm({ onSubmit, organization, userId, className }: PostFormProps) {
  // All hooks at the top
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { startUpload, isUploading } = useUploadThing("postMedia");
  const { orgSlug } = useParams();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // State hooks
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [commandText, setCommandText] = useState("");
  const [currentLine, setCurrentLine] = useState("");

  // Callbacks
  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    const lines = newContent.split('\n');
    
    // Find the current line and its start position
    let currentLineIndex = 0;
    let currentPos = 0;
    
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= cursorPos) {
        currentLineIndex = i;
        break;
      }
      currentPos += lines[i].length + 1;
    }
    
    const line = lines[currentLineIndex];
    const isCommand = line.startsWith('/');
    
    setContent(newContent);
    setCursorPosition(cursorPos);
    setCurrentLine(line);
    
    if (isCommand) {
      const command = line.slice(1).trim();
      setCommandText(command);
      setShowCommandMenu(true);
    } else {
      setCommandText('');
      setShowCommandMenu(false);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape' && showCommandMenu) {
      setShowCommandMenu(false);
      setCommandText("");
    } else if (e.key === ' ' && showCommandMenu) {
      // Prevent space from being added when selecting command
      e.preventDefault();
    }
  };

  const handleCommandSelect = useCallback((command: FormatCommand) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const lines = content.split('\n');
    let currentLineStart = 0;
    let currentLineIndex = 0;

    // Find the current line
    for (let i = 0; i < lines.length; i++) {
      if (currentLineStart + lines[i].length >= cursorPosition) {
        currentLineIndex = i;
        break;
      }
      currentLineStart += lines[i].length + 1;
    }

    // Format the current line, handling empty commands
    const lineContent = lines[currentLineIndex].slice(1).trim();
    lines[currentLineIndex] = command.format(lineContent || '');

    // Update content
    const newContent = lines.join('\n');
    setContent(newContent);
    
    // Close command menu
    setShowCommandMenu(false);
    setCommandText('');

    // Focus and move cursor to end of line
    requestAnimationFrame(() => {
      textarea.focus();
      const newPosition = currentLineStart + lines[currentLineIndex].length;
      textarea.setSelectionRange(newPosition, newPosition);
    });
  }, [content, cursorPosition]);

  // Early returns after all hooks
  if (status === "loading") {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
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

      // Ensure we have content
      if (!content.trim()) {
        throw new Error("Please enter some content for your post");
      }

      const postData = {
        content: content.trim(),
        mediaUrls,
        orgSlug,
      };

      console.log('[FORM_DEBUG] Creating post with data:', postData);
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
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex gap-4">
        <UserAvatar 
          avatarUrl={session.user.image}
          size={44}
          className="shrink-0"
        />
        <div className="flex-1 space-y-3 relative">
          <Textarea
            ref={textareaRef}
            placeholder="What's on your mind? Type / for formatting..."
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            className="min-h-[120px] resize-none border-none bg-muted/40 px-4 py-3 text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 rounded-lg"
          />
          <CommandMenu
            isOpen={showCommandMenu}
            onClose={() => {
              setShowCommandMenu(false);
              setCommandText("");
            }}
            onSelect={handleCommandSelect}
            filter={commandText}
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
  