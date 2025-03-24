import { getDirectUploadthingUrl } from "@/lib/uploadthing";
import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";

// Extend the NodeViewProps to include our specific attributes
type MediaComponentProps = NodeViewProps & {
  node: {
    attrs: {
      src: string;
      alt?: string;
      title?: string;
      type: "image" | "video" | "audio";
      width?: string;
      height?: string;
    };
  };
  selected: boolean;
};

const MediaComponent: React.FC<MediaComponentProps> = ({
  node,
  selected,
  editor,
  getPos,
}) => {
  const { src, alt, title, type, width = "100%", height = "auto" } = node.attrs;
  const mediaWrapperClass = `media-wrapper ${type}-wrapper ${selected ? "selected" : ""}`;

  // State to track loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processedUrl, setProcessedUrl] = useState<string>(src);

  // Process the URL to ensure it works with UploadThing
  useEffect(() => {
    // Process the URL to make sure it's direct and accessible
    if (src) {
      try {
        // Use utility function to convert UploadThing URL to direct URL
        const directUrl = getDirectUploadthingUrl(src);

        // Always use media proxy for videos to avoid CORS issues
        if (type === "video") {
          // Add a timestamp to bust cache
          const proxyUrl = `/api/v1/media-proxy?url=${encodeURIComponent(directUrl)}&t=${Date.now()}`;
          setProcessedUrl(proxyUrl);
        } else {
          setProcessedUrl(directUrl);
        }

        setIsLoading(false);
      } catch (e) {
        console.error("Error processing media URL:", e);
        setError("Failed to load media");
        setIsLoading(false);
      }
    }
  }, [src, type]);

  // Handle media errors
  const handleMediaError = () => {
    setError("Failed to load media");
    console.error("Media error for URL:", processedUrl);
  };

  return (
    <NodeViewWrapper className={`${mediaWrapperClass} relative my-4`}>
      {type === "image" && (
        <div className="relative aspect-video overflow-hidden rounded-md">
          <img
            src={processedUrl}
            alt={alt ?? "Image"}
            title={title}
            style={{
              width,
              height,
              display: "block",
              maxWidth: "100%",
            }}
            className="rounded-md object-cover"
            onError={handleMediaError}
          />
        </div>
      )}

      {type === "video" && (
        <div className="relative aspect-video overflow-hidden rounded-md">
          <video
            src={processedUrl}
            controls
            preload="metadata"
            style={{
              width,
            }}
            className="h-full w-full rounded-md object-cover"
            onError={handleMediaError}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {type === "audio" && (
        <div className="rounded-md bg-muted p-4">
          <audio
            src={processedUrl}
            controls
            style={{
              width: "100%",
            }}
            onError={handleMediaError}
          >
            Your browser does not support the audio tag.
          </audio>
        </div>
      )}

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="rounded-md bg-destructive/10 p-3 text-destructive">
            {error}
          </div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

export default MediaComponent;
