import { getDirectUploadthingUrl } from "@/lib/uploadthing-client";
import type { Media } from "@prisma/client";
import { useState } from "react";

export type MediaPreviewProps = {
  media: Media;
};

// Generate a colored placeholder based on the media ID for consistency
function generatePlaceholderImage(id: string): string {
  // Use the first 6 characters of the ID as a hex color
  const color = id.substring(0, 6).padEnd(6, "f");
  const textColor =
    parseInt(color.substring(0, 2), 16) > 128 ? "000000" : "ffffff";

  // Create a data URL for an SVG placeholder
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 300 200'%3E%3Crect width='300' height='200' fill='%23${color}'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%23${textColor}'%3EMedia%3C/text%3E%3C/svg%3E`;
}

// Create shortcodes for filenames to hide sensitive information
function createShortcode(url: string): string {
  const parts = url.split("/");
  const filename = parts[parts.length - 1] || "";
  return `${filename.substring(0, 8)}...`;
}

export function MediaPreview({ media }: MediaPreviewProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Create a fallback image URL
  const placeholderImage = generatePlaceholderImage(media.id);
  const shortcode = createShortcode(media.url);

  // Transform URL for UploadThing URLs with proper handling
  const transformUrl = (url: string): string => {
    // If it's already a data URI, return as is
    if (url.startsWith("data:")) return url;

    // Use the UploadThing utility for proper URL transformation
    const directUrl = getDirectUploadthingUrl(url);

    // Ensure the URL is absolute
    let absoluteUrl = directUrl;
    if (
      !absoluteUrl.startsWith("http://") &&
      !absoluteUrl.startsWith("https://")
    ) {
      if (
        absoluteUrl.startsWith("utfs.io/") ||
        absoluteUrl.includes(".utfs.io/")
      ) {
        absoluteUrl = `https://${absoluteUrl}`;
      } else if (!absoluteUrl.startsWith("/")) {
        absoluteUrl = `https://${absoluteUrl}`;
      }
    }

    // Always use the proxy in development to avoid CORS issues
    // In production, the proxy is also used for authentication
    return `/api/v1/media-proxy?url=${encodeURIComponent(absoluteUrl)}&t=${Date.now()}`;
  };

  // Try different URL formats with progressive enhancement
  const tryUrls = [
    // 1. First try using our authenticated proxy route
    transformUrl(media.url),

    // 2. Try direct access with the transformed URL as a fallback
    (() => {
      const directUrl = getDirectUploadthingUrl(media.url);
      // Ensure it's absolute
      let absoluteUrl = directUrl;
      if (
        !absoluteUrl.startsWith("http://") &&
        !absoluteUrl.startsWith("https://")
      ) {
        if (
          absoluteUrl.startsWith("utfs.io/") ||
          absoluteUrl.includes(".utfs.io/")
        ) {
          absoluteUrl = `https://${absoluteUrl}`;
        } else if (!absoluteUrl.startsWith("/")) {
          absoluteUrl = `https://${absoluteUrl}`;
        }
      }
      // Use a different proxy URL format as a fallback
      return `/api/v1/media-proxy?url=${encodeURIComponent(absoluteUrl)}&t=${Date.now() + 100}`;
    })(),

    // 3. Add our hardcoded fallback domain just in case
    (() => {
      const fileId = media.url.split("/").pop();
      if (fileId && fileId.length > 20) {
        // Use the public endpoint (/p/) instead of the private one (/f/)
        const fallbackUrl = `https://utfs.io/p/${fileId}`;
        return `/api/v1/media-proxy?url=${encodeURIComponent(fallbackUrl)}&t=${Date.now() + 200}`;
      }
      return "";
    })(),

    // 4. As last resort, use our placeholder
    placeholderImage,
  ].filter(Boolean); // Remove empty items

  // Start with the placeholder during development to reduce errors
  const initialUrlIndex = process.env.NODE_ENV === "development" ? 2 : 0;
  const [currentUrlIndex, setCurrentUrlIndex] = useState(initialUrlIndex);
  const currentUrl = tryUrls[currentUrlIndex];

  // Handle image loading errors by trying the next URL format
  const handleImageError = () => {
    // Only log errors in development for debugging, but be less verbose
    if (
      process.env.NODE_ENV === "development" &&
      !currentUrl.startsWith("data:")
    ) {
      // Use a more concise error format
      console.debug(`[MEDIA_DEBUG] Trying next format for ${shortcode}`);
    }

    if (currentUrlIndex < tryUrls.length - 1) {
      // Try the next URL format
      setCurrentUrlIndex(currentUrlIndex + 1);
    } else {
      // All formats failed, show error state
      setImageError(true);
    }
  };

  // Handle successful image loading
  const handleImageLoad = () => {
    // Only log in development and be less verbose
    if (
      process.env.NODE_ENV === "development" &&
      !currentUrl.startsWith("data:")
    ) {
      console.debug(`[MEDIA_DEBUG] Loaded ${shortcode} successfully`);
    }
    setImageLoaded(true);
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted">
      {imageError ? (
        // Show a colored placeholder with media ID if all image URLs fail
        <div
          className="flex size-full items-center justify-center"
          style={{ backgroundImage: `url(${placeholderImage})` }}
        >
          <span className="rounded-md bg-black/50 px-2 py-1 text-xs text-white">
            Media {shortcode}
          </span>
        </div>
      ) : (
        // Try to load the image with the current URL format
        <img
          key={currentUrl} // Force re-render when URL changes
          src={currentUrl}
          alt={`Media ${shortcode}`}
          className="size-full object-cover"
          loading="lazy"
          onError={handleImageError}
          onLoad={handleImageLoad}
          style={{ opacity: imageLoaded ? 1 : 0 }}
          // Add authentication for UploadThing URLs
          crossOrigin="anonymous"
        />
      )}

      {/* Show loading state */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}

export type MediaPreviewsProps = {
  attachments: Media[];
};

export function MediaPreviews({ attachments }: MediaPreviewsProps) {
  // Add debugging for attachments
  console.log("[MEDIA_DEBUG] MediaPreviews attachments:", attachments);

  const gridClassName =
    attachments.length === 1
      ? ""
      : attachments.length === 2
        ? "grid grid-cols-2 gap-1"
        : attachments.length === 3
          ? "grid grid-cols-2 gap-1"
          : "grid grid-cols-2 gap-1";

  return (
    <div className={gridClassName}>
      {attachments.slice(0, 4).map((media) => (
        <MediaPreview key={media.id} media={media} />
      ))}
    </div>
  );
}
