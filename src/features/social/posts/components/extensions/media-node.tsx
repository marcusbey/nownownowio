import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer, NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { FilmIcon, Volume2 } from "lucide-react";
import Image from "next/image";
import React from "react";

// React component for rendering the media node
const MediaNodeView: React.FC<NodeViewProps> = (props) => {
  // Cast the node attrs to the expected type
  const { src, alt, type } = props.node.attrs as { 
    src: string; 
    alt?: string; 
    type: "image" | "video" | "audio" 
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
            src={src}
            alt={alt || ""}
            fill
            className="object-cover"
            draggable={false}
          />
        </div>
      ) : type === "video" ? (
        <div className="relative size-full">
          <video
            src={src}
            className="size-full object-cover"
            controls
            draggable={false}
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0">
            <FilmIcon className="size-8 text-white opacity-70" />
          </div>
        </div>
      ) : (
        <div className="relative flex w-full items-center rounded-md bg-gray-100 p-4 dark:bg-gray-800">
          <div className="mr-3">
            <Volume2 className="size-6 text-primary" />
          </div>
          <audio
            src={src}
            className="w-full"
            controls
            draggable={false}
          />
        </div>
      )}
    </NodeViewWrapper>
  );
};

// Define the Media extension
export const MediaNode = Node.create({
  name: "mediaNode",
  group: "block",
  selectable: true,
  draggable: true,
  
  // Define the attributes for the media node
  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      type: {
        default: "image",
        parseHTML: (element) => {
          return element.getAttribute("data-type") || "image";
        },
      },
    };
  },

  // Define how the node should be parsed from HTML
  parseHTML() {
    return [
      {
        tag: 'div[data-type="image"]',
        getAttrs: (el) => {
          if (typeof el === "string" || !(el instanceof HTMLElement)) return {};
          
          const img = el.querySelector("img");
          return {
            src: img?.getAttribute("src"),
            alt: img?.getAttribute("alt"),
            type: "image",
          };
        },
      },
      {
        tag: 'div[data-type="video"]',
        getAttrs: (el) => {
          if (typeof el === "string" || !(el instanceof HTMLElement)) return {};
          
          const video = el.querySelector("video");
          return {
            src: video?.getAttribute("src"),
            type: "video",
          };
        },
      },
      {
        tag: 'div[data-type="audio"]',
        getAttrs: (el) => {
          if (typeof el === "string" || !(el instanceof HTMLElement)) return {};
          
          const audio = el.querySelector("audio");
          return {
            src: audio?.getAttribute("src"),
            type: "audio",
          };
        },
      },
    ];
  },

  // Define how the node should be rendered to HTML
  renderHTML({ HTMLAttributes }) {
    const { type } = HTMLAttributes;
    
    if (type === "video") {
      return [
        "div",
        { "data-type": "video", class: "media-node" },
        ["video", { src: HTMLAttributes.src, controls: "true" }],
      ];
    } else if (type === "audio") {
      return [
        "div",
        { "data-type": "audio", class: "media-node" },
        ["audio", { src: HTMLAttributes.src, controls: "true" }],
      ];
    }
    
    return [
      "div",
      { "data-type": "image", class: "media-node" },
      ["img", mergeAttributes({ src: HTMLAttributes.src, alt: HTMLAttributes.alt || "" })],
    ];
  },

  // Use React to render the node
  addNodeView() {
    return ReactNodeViewRenderer(MediaNodeView);
  },
});

export default MediaNode;
