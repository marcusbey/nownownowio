import { Button } from "@/components/core/button";
import { Progress } from "@/components/feedback/progress";
import { cn } from "@/lib/utils";
import { FilmIcon, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
// We don't need to import useDropzone here as we're receiving props from parent
import type { DropzoneRootProps } from "react-dropzone";
import type { MediaFile } from "../types";
import type { Editor } from "@tiptap/react";

type MediaPromptProps = {
  mediaFiles: MediaFile[];
  mediaType: "image" | "video" | "audio";
  mediaTab: "upload" | "embed";
  isUploading: boolean;
  embedUrl: string;
  editor?: Editor | null;
  setMediaType: (type: "image" | "video" | "audio") => void;
  setMediaTab: (tab: "upload" | "embed") => void;
  setEmbedUrl: (url: string) => void;
  setShowMediaPrompt: (show: boolean) => void;
  onDrop: (acceptedFiles: File[]) => void;
  removeMedia: (index: number) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  getRootProps: (props?: DropzoneRootProps) => DropzoneRootProps;
  getInputProps: () => React.InputHTMLAttributes<HTMLInputElement>;
  isDragActive: boolean;
  confirmMediaSelection: () => void;
  cancelMediaSelection: () => void;
  handleMediaInsert?: (url: string) => void;
};

export function MediaPrompt({
  mediaFiles,
  mediaType,
  mediaTab,
  isUploading,
  embedUrl,
  setMediaType,
  setMediaTab,
  setEmbedUrl,
  onDrop: _onDrop, // Renamed to avoid unused parameter warning
  removeMedia,
  confirmMediaSelection,
  cancelMediaSelection,
  getRootProps,
  getInputProps,
  isDragActive,
  handleMediaInsert,
}: MediaPromptProps) {
  // Add useEffect for handling Escape key globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        cancelMediaSelection();
      }
    };
    
    // Add event listener
    document.addEventListener("keydown", handleKeyDown);
    
    // Clean up
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [cancelMediaSelection]);

  // Handle click outside
  const dialogRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target as Node)) {
        cancelMediaSelection();
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cancelMediaSelection]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      tabIndex={-1}
    >
      <div 
        ref={dialogRef}
        className="w-[500px] max-w-[90vw] rounded-lg border bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900"
      >
        <h3 className="mb-3 text-lg font-medium">
          {mediaType === "image"
            ? "Add Image"
            : mediaType === "video"
            ? "Add Video"
            : "Add Audio"}
        </h3>

        {/* Tab selection */}
        <div className="mb-4 flex gap-4">
          <button
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium",
              mediaTab === "upload"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            onClick={() => setMediaTab("upload")}
          >
            Upload
          </button>
          <button
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium",
              mediaTab === "embed"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            onClick={() => setMediaTab("embed")}
          >
            Embed
          </button>
        </div>

        {/* Media type selection */}
        <div className="mb-4 flex gap-4">
          <button
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium",
              mediaType === "image"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            onClick={() => setMediaType("image")}
          >
            Image
          </button>
          <button
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium",
              mediaType === "video"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            onClick={() => setMediaType("video")}
          >
            Video
          </button>
          <button
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium",
              mediaType === "audio"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80"
            )}
            onClick={() => setMediaType("audio")}
          >
            Audio
          </button>
        </div>

        {mediaTab === "upload" ? (
          <>
            {/* Media Preview Section */}
            {mediaFiles.length > 0 && (
              <div
                className={cn(
                  "mb-4 grid gap-2",
                  mediaFiles.length === 1
                    ? "grid-cols-1"
                    : mediaFiles.length === 2
                    ? "grid-cols-2"
                    : "grid-cols-2 sm:grid-cols-3"
                )}
              >
                {mediaFiles.map((media, index) => (
                  <div
                    key={index}
                    className="group relative aspect-video overflow-hidden rounded-md bg-muted"
                  >
                    {media.type === "image" ? (
                      <Image
                        src={media.previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : media.type === "video" ? (
                      <video
                        src={media.previewUrl}
                        className="size-full object-cover"
                        controls
                      />
                    ) : (
                      <audio
                        src={media.previewUrl}
                        className="absolute bottom-0 left-0 w-full"
                        controls
                      />
                    )}

                    {/* Upload progress indicator */}
                    {media.uploading && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 p-2 text-white">
                        <Loader2 className="mb-2 size-6 animate-spin" />
                        <Progress
                          value={media.progress}
                          className="h-1 w-full"
                        />
                        <span className="mt-1 text-xs">
                          {media.progress}%
                        </span>
                      </div>
                    )}

                    {/* Remove button */}
                    <button
                      className="absolute right-1 top-1 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
                      onClick={() => removeMedia(index)}
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Dropzone */}
            {mediaFiles.length < 4 && !isUploading && (
              <div
                {...getRootProps()}
                className={cn(
                  "mb-4 cursor-pointer rounded-md border-2 border-dashed p-4 transition-colors",
                  isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-muted hover:border-muted-foreground/50"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  {mediaType === "image" ? (
                    <ImagePlus className="size-8 text-muted-foreground" />
                  ) : (
                    <FilmIcon className="size-8 text-muted-foreground" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    Drag & drop {mediaType} files here, or click to select
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Max 4 files, 10MB each
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="mb-4">
            <label
              htmlFor="embed-url"
              className="mb-2 block text-sm font-medium"
            >
              {mediaType === "image"
                ? "Image URL"
                : mediaType === "video"
                ? "Video URL"
                : "Audio URL"}
            </label>
            <input
              type="text"
              id="embed-url"
              value={embedUrl}
              onChange={(e) => setEmbedUrl(e.target.value)}
              placeholder={`Enter ${mediaType} URL...`}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={cancelMediaSelection}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (mediaTab === "upload") {
                confirmMediaSelection();
              } else if (embedUrl.trim() && handleMediaInsert) {
                // Use handleMediaInsert for embed URLs
                handleMediaInsert(embedUrl.trim());
                cancelMediaSelection();
              } else {
                confirmMediaSelection();
              }
            }}
            disabled={
              (mediaTab === "upload" && mediaFiles.length === 0) ||
              (mediaTab === "embed" && !embedUrl.trim())
            }
          >
            Insert
          </Button>
        </div>
      </div>
    </div>
  );
}