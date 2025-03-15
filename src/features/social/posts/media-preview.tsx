import type { Media } from "@prisma/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";

// Helper function to convert a direct URL to a proxied URL
function getProxiedMediaUrl(url: string): string {
  // If the URL already includes our domain or is already proxied, return it as is
  if (url.includes("/api/v1/media-proxy")) {
    return url;
  }
  
  // Add a cache-busting parameter to prevent stale images
  const timestamp = Date.now();
  return `/api/v1/media-proxy?url=${encodeURIComponent(url)}&t=${timestamp}`;
}

// Helper to check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Generate a placeholder image URL based on media type
function getPlaceholderUrl(media: Media): string {
  // Use a consistent placeholder instead of random images
  if (media.type === "VIDEO") {
    // Use a fixed placeholder for videos (16:9 ratio)
    return `/placeholder-video.jpg`;
  }
  
  // Use a fixed placeholder for images (1:1 ratio)
  return `/placeholder-image.jpg`;
}

export type MediaPreviewProps = {
  media: Media;
}

export function MediaPreview({ media }: MediaPreviewProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string>("");
  
  // Set up the media URL with development mode handling
  useEffect(() => {
    // Safety check - if URL is empty or undefined, use a placeholder
    if (!media.url || media.url === "") {
      // Use a placeholder instead of empty string
      setMediaUrl(getPlaceholderUrl(media));
      return;
    }

    // Don't use random placeholder images for development mode
    // as they cause confusion with actual uploaded media
    if (isDevelopment && media.url.includes("utfs.io")) {
      // Use the actual URL instead of a placeholder
      setMediaUrl(getProxiedMediaUrl(media.url));
      return;
    }
    
    // For real media or production, use the proxied URL
    setMediaUrl(getProxiedMediaUrl(media.url));
  }, [media]);
  
  // Error handler for media loading failures
  const handleError = () => {
    // In case of error, try to use a placeholder
    setMediaUrl(getPlaceholderUrl(media));
    setHasError(true);
    setIsLoading(false);
  };
  
  // Loading complete handler
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  // If there was an error loading the media, show a fallback
  if (hasError) {
    return (
      <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted/20">
        <p className="text-sm text-muted-foreground">Media unavailable</p>
      </div>
    );
  }
  
  // Handle different media types based on the type field
  if (media.type === "IMAGE" || !media.type) {
    return (
      <div className="relative overflow-hidden rounded-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {mediaUrl ? (
          <Image
            src={mediaUrl}
            alt="Media preview"
            width={500}
            height={500}
            className={cn(
              "mx-auto size-fit max-h-[30rem] rounded-lg object-cover",
              isLoading && "opacity-0"
            )}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={handleError}
            onLoad={handleLoad}
            priority={true}
          />
        ) : (
          <div className="flex h-48 w-full items-center justify-center rounded-lg bg-muted/20">
            <p className="text-sm text-muted-foreground">Media unavailable</p>
          </div>
        )}
      </div>
    );
  }

  // Handle video media type
  if (media.type === "VIDEO" && mediaUrl) {
    return (
      <div className="relative overflow-hidden rounded-lg">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        <video
          src={mediaUrl}
          controls
          className={cn(
            "mx-auto size-fit max-h-[30rem] rounded-lg",
            isLoading && "opacity-0"
          )}
          onError={handleError}
          onLoadedData={handleLoad}
        />
      </div>
    );
  }

  // Fallback for unsupported media types
  return <p className="text-destructive">Unsupported media type</p>;
}

export type MediaPreviewsProps = {
  attachments: Media[];
}

export function MediaPreviews({ attachments }: MediaPreviewsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        attachments.length > 1 && "sm:grid sm:grid-cols-2"
      )}
    >
      {attachments.slice(0, 4).map((media) => (
        <MediaPreview key={media.id} media={media} />
      ))}
    </div>
  );
}
