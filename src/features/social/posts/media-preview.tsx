import type { Media } from "@prisma/client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { env } from "@/lib/env";
// We're using this import for type checking only, actual function is server-side only

// Helper function to convert a direct URL to a proxied URL
function getProxiedMediaUrl(url: string): string {
  // Safety check for empty or invalid URLs
  if (!url || typeof url !== 'string') {
    console.log('[MediaPreview] Empty or invalid URL:', url);
    return '';
  }

  console.log('[MediaPreview] Processing URL:', url);

  // If the URL already includes our domain or is already proxied, return it as is
  if (url.includes("/api/v1/media-proxy")) {
    console.log('[MediaPreview] URL is already proxied');
    return url;
  }
  
  // Get the app ID from environment variables
  // Using the env module to ensure proper access to environment variables
  const appId = env.NEXT_PUBLIC_UPLOADTHING_ID;
  console.log('[MediaPreview] Using app ID:', appId);
  
  let processedUrl = url;
  
  // Simplified URL handling for UploadThing URLs
  if (url.includes('utfs.io')) {
    console.log('[MediaPreview] Found utfs.io URL, extracting file key');
    // Extract the file key from legacy utfs.io URLs
    // Use a more permissive regex pattern to handle longer file keys
    const matches = url.match(/\/[pf]\/([\w-]+[\w\d]+)/);
    
    console.log('[MediaPreview] Regex matches:', matches);
    
    if (matches?.[1] && appId) {
      // Convert to the new format with the correct app ID
      // Trim any whitespace or unexpected characters from the file key
      const fileKey = matches[1].trim();
      
      // Create a proxied URL that will go through our media-proxy endpoint
      processedUrl = `/api/v1/media-proxy?url=${encodeURIComponent(`https://${appId}.ufs.sh/f/${fileKey}`)}`;
      console.log('[MediaPreview] Created proxied URL:', processedUrl);
    } else {
      // If we couldn't extract the file key, use the original URL but proxied
      processedUrl = `/api/v1/media-proxy?url=${encodeURIComponent(url)}`;
      console.log('[MediaPreview] Using original URL with proxy:', processedUrl);
    }
  } else if (!url.includes('.ufs.sh/f/') && !url.includes('picsum.photos')) {
    // For non-UploadThing and non-placeholder URLs, ensure they have proper protocol
    processedUrl = url.startsWith('http') ? url : `https://${url}`;
    console.log('[MediaPreview] Added protocol to URL:', processedUrl);
  }
  
  // Add a cache-busting parameter to prevent stale images
  const timestamp = Date.now();
  const finalUrl = `/api/v1/media-proxy?url=${encodeURIComponent(processedUrl)}&t=${timestamp}`;
  console.log('[MediaPreview] Final proxied URL:', finalUrl);
  
  return finalUrl;
}

// Helper to check if we're in development mode
const isDevelopment = process.env.NODE_ENV === "development";

// Generate a placeholder image URL based on media type and ID
function getPlaceholderUrl(media: Media): string {
  // Use a consistent hash from the media ID to get the same placeholder for the same media
  const hash = media.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % 1000;
  
  if (media.type === "VIDEO") {
    return `https://picsum.photos/seed/${hash}/800/450`; // 16:9 ratio for videos
  }
  
  return `https://picsum.photos/seed/${hash}/800/800`; // 1:1 ratio for images
}

export type MediaPreviewProps = {
  media: Media;
}

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
    if (!mediaObj.url || typeof mediaObj.url !== 'string' || mediaObj.url === "") {
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
    const processedUrl = getProxiedMediaUrl(mediaObj.url);
    
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
  
  if (media.type === "IMAGE") {
    return (
      <div className={cn(
        "relative w-full overflow-hidden rounded-md bg-muted",
        hasError ? "aspect-square" : "aspect-square" // Force aspect-square to fix height issues
      )}>
        {mediaUrl && (
          <Image
            src={mediaUrl}
            alt="Post image"
            fill
            className={cn(
              "object-cover transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
              hasError ? "hidden" : "block"
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
            <span className="text-sm text-muted-foreground">Image could not be loaded</span>
          </div>
        )}
      </div>
    );
  }
  
  // Handle VIDEO media type
  if (media.type === "VIDEO") {
    return (
      <div className={cn(
        "relative w-full overflow-hidden rounded-md",
        "aspect-video shadow-sm border border-border/20 bg-black/5" // Enhanced styling for videos
      )}>
        {mediaUrl && (
          <div className="relative size-full group">
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
              <p className="text-xs font-medium text-muted-foreground animate-pulse">Loading video...</p>
            </div>
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/90 backdrop-blur-sm p-4 text-center">
            <div className="rounded-full bg-destructive/10 p-3">
              <span className="text-destructive text-xl">!</span>
            </div>
            <p className="text-sm font-medium text-foreground">Video failed to load</p>
            <p className="text-xs text-muted-foreground">Please try again later</p>
          </div>
        )}
      </div>
    );
  }
  
  // For other media types we don't yet support
  return (
    <div className="flex aspect-video w-full items-center justify-center rounded-md bg-muted">
      <span className="text-sm text-muted-foreground">Unsupported media type: {media.type}</span>
    </div>
  );
}

export type MediaPreviewsProps = {
  attachments: Media[];
}

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
