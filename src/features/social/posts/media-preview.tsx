import { env } from "@/lib/env";
import { cn } from "@/lib/utils";
import type { Media } from "@prisma/client";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

// Helper function to convert a direct URL to a proxied URL
function getProxiedMediaUrl(url: string): string {
  // Safety check for empty or invalid URLs
  if (!url || typeof url !== "string") {
    return "";
  }

  // If the URL already includes our domain or is already proxied, return it as is
  if (url.includes("/api/v1/media-proxy")) {
    // But ensure we refresh the timestamp to avoid caching issues
    const baseUrl = url.split("&t=")[0];
    return `${baseUrl}&t=${Date.now()}`;
  }

  // Get the app ID from environment variables
  const appId = env.NEXT_PUBLIC_UPLOADTHING_ID;

  let processedUrl = url;

  // Simplified URL handling for UploadThing URLs
  if (url.includes("utfs.io") || url.includes("ufs.sh")) {
    // Extract the file key pattern
    const matches = url.match(/\/[pf]\/([^?&]+)/);

    if (matches?.[1] && appId) {
      // Convert to the new format with the correct app ID
      // Trim any whitespace or unexpected characters from the file key
      const fileKey = matches[1].trim();

      // For UploadThing URLs, use the direct domain format
      processedUrl = `https://${appId}.ufs.sh/f/${fileKey}`;
    }
  } else if (!url.startsWith("http") && !url.startsWith("/")) {
    // For URLs without protocol, add https://
    processedUrl = `https://${url}`;
  }

  // Always use the media proxy to avoid CORS issues
  const timestamp = Date.now();
  return `/api/v1/media-proxy?url=${encodeURIComponent(processedUrl)}&t=${timestamp}`;
}

// Helper to check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Generate a placeholder image URL based on media type and ID
function getPlaceholderUrl(media: Media): string {
  // Use a consistent hash from the media ID to get the same placeholder for the same media
  const hash =
    media.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    1000;

  if (media.type === "VIDEO") {
    return `https://picsum.photos/seed/${hash}/800/450`; // 16:9 ratio for videos
  }

  return `https://picsum.photos/seed/${hash}/800/800`; // 1:1 ratio for images
}

export type MediaPreviewProps = {
  media: Media;
};

export function MediaPreview({ media }: MediaPreviewProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string>("");

  // Process media URL and handle errors
  const processMediaUrl = useCallback((mediaObj: Media) => {
    // Reset states when processing a new URL
    setIsLoading(true);
    setHasError(false);

    // Safety check - if URL is empty, undefined, or not a string
    if (
      !mediaObj.url ||
      typeof mediaObj.url !== "string" ||
      mediaObj.url === ""
    ) {
      // Use a placeholder instead of empty string
      setMediaUrl(getPlaceholderUrl(mediaObj));
      return;
    }

    // In development mode with test data, use placeholder images
    if (isDevelopment && mediaObj.url.includes("utfs.io/p/32NrzzTW2")) {
      setMediaUrl(getPlaceholderUrl(mediaObj));
      return;
    }

    // For real media, use the proxied URL
    let processedUrl = getProxiedMediaUrl(mediaObj.url);

    // For videos, always ensure we use the media proxy
    if (
      mediaObj.type === "VIDEO" &&
      !processedUrl.includes("/api/v1/media-proxy")
    ) {
      processedUrl = `/api/v1/media-proxy?url=${encodeURIComponent(processedUrl)}&t=${Date.now()}`;
    }

    // Validate the URL is not empty after processing
    if (!processedUrl) {
      // Use a placeholder if processing resulted in empty URL
      setMediaUrl(getPlaceholderUrl(mediaObj));
      return;
    }

    setMediaUrl(processedUrl);
  }, []);

  // Set up the media URL with development mode handling
  useEffect(() => {
    processMediaUrl(media);
  }, [media, processMediaUrl]);

  // Error handler for media loading failures
  const handleError = () => {
    // In case of error, try to use a placeholder
    setMediaUrl(getPlaceholderUrl(media));
    setHasError(true);
    setIsLoading(false);
  };

  // Loading handler
  const handleLoad = () => {
    setIsLoading(false);
  };

  // Handle IMAGE type
  if (media.type === "IMAGE") {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md bg-muted",
          hasError ? "aspect-square" : "aspect-square", // Force aspect-square to fix height issues
        )}
      >
        {mediaUrl && (
          <Image
            src={mediaUrl}
            alt="Post image"
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
              hasError ? "hidden" : "block",
            )}
            onError={handleError}
            onLoad={handleLoad}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        )}

        {/* Loading state */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted p-4 text-center">
            <span className="text-sm text-muted-foreground">
              Image could not be loaded
            </span>
          </div>
        )}
      </div>
    );
  }

  // Handle VIDEO type specifically without using Next.js Image
  if (media.type === "VIDEO") {
    return (
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md",
          "aspect-video shadow-sm border border-border/20 bg-black/5", // Enhanced styling for videos
        )}
      >
        {mediaUrl && (
          <div className="group relative size-full">
            <video
              src={mediaUrl}
              className="size-full object-contain"
              controls
              preload="metadata"
              playsInline
              controlsList="nodownload"
              onError={handleError}
              onLoadedData={handleLoad}
              poster={getPlaceholderUrl(media)}
            />
          </div>
        )}

        {/* Loading state */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="size-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
              <p className="animate-pulse text-xs font-medium text-muted-foreground">
                Loading video...
              </p>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 p-4 text-center backdrop-blur-sm">
            <div className="rounded-full bg-destructive/10 p-3">
              <span className="text-xl text-destructive">!</span>
            </div>
            <p className="text-sm font-medium text-foreground">
              Video failed to load
            </p>
            <p className="text-xs text-muted-foreground">
              Please try again later
            </p>
          </div>
        )}
      </div>
    );
  }

  // For other media types we don't yet support
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted">
      <span className="text-sm text-muted-foreground">
        Unsupported media type: {media.type}
      </span>
    </div>
  );
}

export type MediaPreviewsProps = {
  attachments: Media[];
};

export function MediaPreviews({ attachments }: MediaPreviewsProps) {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  return (
    <div className="mt-3 grid grid-cols-1 gap-2">
      {attachments.map((media) => (
        <MediaPreview key={media.id} media={media} />
      ))}
    </div>
  );
}
