import { mergeAttributes, Node } from "@tiptap/core";
import {
  NodeViewWrapper,
  ReactNodeViewRenderer,
  type NodeViewProps,
} from "@tiptap/react";
import { FilmIcon, Loader2, Volume2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState } from "react";

// Helper function to process media URL
function processMediaUrl(url: string, type: string): string {
  if (!url) return url;

  // If it's already a proxied URL, return as is but add a fresh timestamp
  if (url.includes("/api/v1/media-proxy")) {
    // Remove any existing timestamp and add a fresh one
    const baseUrl = url.split("&t=")[0];
    return `${baseUrl}&t=${Date.now()}`;
  }

  // For videos, always use the media proxy
  if (type === "video") {
    return `/api/v1/media-proxy?url=${encodeURIComponent(url)}&t=${Date.now()}`;
  }

  // For other media types, use the original URL
  return url;
}

// React component for rendering the media node
const MediaNodeView: React.FC<NodeViewProps> = (props) => {
  const { src, alt, type } = props.node.attrs as {
    src: string;
    alt?: string;
    type: "image" | "video" | "audio";
  };

  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [processedSrc, setProcessedSrc] = useState(src);

  useEffect(() => {
    // Process the URL based on media type
    setProcessedSrc(processMediaUrl(src, type));
  }, [src, type]);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error(`Failed to load ${type}:`, processedSrc);
  };

  return (
    <NodeViewWrapper
      className="media-node relative my-4 overflow-hidden rounded-md"
      style={{ aspectRatio: type === "audio" ? "auto" : "16/9" }}
      data-type={type}
      contentEditable={false}
    >
      {type === "image" ? (
        <div className="relative size-full">
          <Image
            src={processedSrc}
            alt={alt || ""}
            fill
            className="object-cover"
            draggable={false}
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      ) : type === "video" ? (
        <div className="relative size-full">
          <video
            src={processedSrc}
            className="size-full object-cover"
            controls
            draggable={false}
            onLoadedData={handleLoad}
            onError={handleError}
            crossOrigin="anonymous"
          >
            Your browser does not support video playback.
          </video>
          {!hasError && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <FilmIcon className="size-8 text-white opacity-70" />
            </div>
          )}
        </div>
      ) : (
        <div className="relative flex w-full items-center rounded-md bg-gray-100 p-4 dark:bg-gray-800">
          <div className="mr-3">
            <Volume2 className="size-6 text-primary" />
          </div>
          <audio
            src={processedSrc}
            className="w-full"
            controls
            draggable={false}
            onLoadedData={handleLoad}
            onError={handleError}
            crossOrigin="anonymous"
          />
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-destructive/10">
          <div className="text-sm text-destructive">Failed to load {type}</div>
        </div>
      )}
    </NodeViewWrapper>
  );
};

// Create the extension
export default Node.create({
  name: "mediaNode",
  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      type: {
        default: "image",
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "div[data-type=mediaNode]",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "mediaNode" }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MediaNodeView);
  },
});
