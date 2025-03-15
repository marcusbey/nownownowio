import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/composite/command";
import { Button } from "@/components/core/button";
import { Progress } from "@/components/feedback/progress";
import { useToast } from "@/components/feedback/use-toast";
import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// We'll use TipTap's built-in commands for cursor positioning
import type { Node } from "@tiptap/core";
import { FilmIcon, ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import MediaNode from "./extensions/media-node";

type MediaFile = {
  file: File;
  id?: string;
  previewUrl: string;
  type: "image" | "video";
  uploading: boolean;
  progress: number;
  error?: string;
};

type RichTextEditorProps = {
  onChange?: (content: string) => void;
  onEmojiSelect?: (emoji: string) => void;
  onMediaSelect?: (files: File[]) => void;
  maxLength?: number;
};

const RichTextEditor = React.forwardRef<
  { clearEditor: () => void },
  RichTextEditorProps
>(({ onChange, onMediaSelect, maxLength = 860 }, ref) => {
  const [charCount, setCharCount] = useState(0);
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [commandSearch, setCommandSearch] = React.useState("");
  const menuRef = React.useRef<HTMLDivElement>(null);
  // Define format commands outside of render to avoid re-creating on each render
  const formatCommands = React.useMemo(
    () => [
      { id: "text", label: "Text", icon: "¶", keywords: ["text", "paragraph"] },
      {
        id: "h1",
        label: "Heading 1",
        icon: "H1",
        keywords: ["heading", "title", "h1"],
      },
      {
        id: "h2",
        label: "Heading 2",
        icon: "H2",
        keywords: ["heading", "subtitle", "h2"],
      },
      {
        id: "h3",
        label: "Heading 3",
        icon: "H3",
        keywords: ["heading", "subtitle", "h3"],
      },
      {
        id: "divider",
        label: "Divider",
        icon: "---",
        keywords: ["divider", "separator", "line", "hr"],
      },
      {
        id: "bullet",
        label: "Bullet List",
        icon: "•",
        keywords: ["bullet", "list", "unordered"],
      },
      {
        id: "numbered",
        label: "Numbered List",
        icon: "1.",
        keywords: ["numbered", "list", "ordered"],
      },
      {
        id: "link",
        label: "Link",
        icon: "🔗",
        keywords: ["link", "url", "hyperlink"],
      },
      {
        id: "quote",
        label: "Quote",
        icon: '"',
        keywords: ["quote", "blockquote", "citation"],
      },
      {
        id: "code",
        label: "Code Block",
        icon: "<>",
        keywords: ["code", "codeblock", "programming"],
      },
      {
        id: "image",
        label: "Image",
        icon: "🖼️",
        keywords: ["image", "picture", "photo", "media"],
      },
      {
        id: "video",
        label: "Video",
        icon: "🎬",
        keywords: ["video", "movie", "clip", "media"],
      },
      {
        id: "audio",
        label: "Audio",
        icon: "🔊",
        keywords: ["audio", "sound", "music", "media"],
      },
    ],
    [],
  );

  const [showCommandMenu, setShowCommandMenu] = React.useState(false);
  const [showLinkPrompt, setShowLinkPrompt] = React.useState(false);
  const [showMediaPrompt, setShowMediaPrompt] = React.useState(false);
  const [mediaType, setMediaType] = React.useState<"image" | "video" | "audio">(
    "image",
  );
  const [mediaTab, setMediaTab] = React.useState<"upload" | "embed">("upload");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [embedUrl, setEmbedUrl] = React.useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading] = useState(false);
  const { toast } = useToast();

  /**
   * Filters commands based on the input search string.
   * Handles multi-word searches by skipping non-matching words and filtering based on matching words.
   */
  const filteredCommands = React.useMemo(() => {
    const searchTerm = commandSearch.trim().toLowerCase();
    if (!searchTerm) return formatCommands;

    // First prioritize exact matches for the command ID
    const exactIdMatches = formatCommands.filter(
      (cmd) => cmd.id.toLowerCase() === searchTerm,
    );

    // Then prioritize commands that start with the search term
    const startsWithMatches = formatCommands.filter((cmd) => {
      // Skip exact matches we already included
      if (exactIdMatches.some((m) => m.id === cmd.id)) return false;

      // Check if command ID or label starts with search term
      const idStartsWithTerm = cmd.id.toLowerCase().startsWith(searchTerm);
      const labelStartsWithTerm = cmd.label
        .toLowerCase()
        .startsWith(searchTerm);

      // Check if any keyword starts with search term
      let keywordStartsWithTerm = false;
      if (Array.isArray(cmd.keywords) && cmd.keywords.length > 0) {
        keywordStartsWithTerm = cmd.keywords.some((k) =>
          k.toLowerCase().startsWith(searchTerm),
        );
      }

      return idStartsWithTerm || labelStartsWithTerm || keywordStartsWithTerm;
    });

    // Finally include commands that contain the search term anywhere
    const containsMatches = formatCommands.filter((cmd) => {
      // Skip commands we already included
      if (
        exactIdMatches.some((m) => m.id === cmd.id) ||
        startsWithMatches.some((m) => m.id === cmd.id)
      )
        return false;

      const cmdText = `${cmd.id} ${cmd.label}`.toLowerCase();
      if (cmdText.includes(searchTerm)) return true;

      // Check if any keyword contains the search term
      if (Array.isArray(cmd.keywords) && cmd.keywords.length > 0) {
        return cmd.keywords.some((keyword) =>
          keyword.toLowerCase().includes(searchTerm),
        );
      }

      return false;
    });

    // Combine all matches in priority order
    return [...exactIdMatches, ...startsWithMatches, ...containsMatches];
  }, [commandSearch, formatCommands]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCommandMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global keyboard event listener to handle Escape key for all popups
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // Close any open popups
        if (showCommandMenu) {
          setShowCommandMenu(false);
        }
        if (showLinkPrompt) {
          cancelLink();
        }
        if (showMediaPrompt) {
          cancelMediaSelection();
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showCommandMenu, showLinkPrompt, showMediaPrompt]);

  const updateMenuPosition = (editor: Editor) => {
    const { view } = editor;
    const { from } = view.state.selection;
    const start = view.coordsAtPos(from);
    const editorBox = view.dom.getBoundingClientRect();

    setMenuPosition({
      x: start.left - editorBox.left,
      y: start.top - editorBox.top + 24, // Add offset for menu to appear below cursor
    });
  };

  const editor = useEditor({
    // Explicitly set immediatelyRender to false to avoid SSR hydration mismatches
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        paragraph: {
          HTMLAttributes: {
            class: "is-empty",
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: "italic border-l-4 border-muted-foreground pl-4 py-1 my-4",
          },
        },
      }),
      MediaNode,
      Placeholder.configure({
        placeholder: ({ node, editor }) => {
          // Skip if we don't have the necessary properties
          if (!node || !editor) return "";

          // Get the node type name safely
          const typeName = node.type.name;
          if (!typeName) return "";

          // Check if this is a paragraph and if it's the first node
          const isParagraph = typeName === "paragraph";
          const doc = editor.state.doc;
          const isFirstNode = doc.firstChild === node;

          if (isParagraph && isFirstNode) {
            return 'Press "/" for commands...';
          }

          switch (node.type.name) {
            case "heading":
              switch (node.attrs.level) {
                case 1:
                  return "Heading 1...";
                case 2:
                  return "Heading 2...";
                case 3:
                  return "Heading 3...";
                default:
                  return "Heading";
              }
            case "bulletList":
              return "List item";
            case "orderedList":
              return "1. List item";
            case "blockquote":
              return "Type a quote...";
            case "codeBlock":
              return "Code";
            case "paragraph":
              return "Write, type '/' for formatting...";
            default:
              return "Write, type '/' for formatting...";
          }
        },
        showOnlyWhenEditable: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const textContent = editor.getText();
      setCharCount(textContent.length);
      onChange?.(html);
    },
    onFocus: ({ editor }) => {
      // If content is empty, move cursor to start
      if (editor.isEmpty) {
        editor.commands.setTextSelection(0);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose-base focus:outline-none leading-relaxed [&_p]:text-base [&_blockquote]:italic [&_*]:!text-foreground [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h1,&_h2,&_h3]:font-medium",
      },
      handleKeyDown: (view, event) => {
        // Prevent typing if character limit is exceeded
        if (charCount >= maxLength && 
            !event.metaKey && !event.ctrlKey && 
            event.key.length === 1 && 
            !event.key.match(/^[\b\x7F\s]$/)) {
          return true; // Prevent the key from being processed
        }
        
        // Restore slash-command menu navigation:
        if (showCommandMenu) {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredCommands.length - 1,
            );
            return true;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((prev) =>
              prev < filteredCommands.length - 1 ? prev + 1 : 0,
            );
            return true;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const selectedCommand = filteredCommands[selectedIndex];
            if (selectedCommand) {
              applyFormat(selectedCommand);
              // Ensure we focus the editor after applying format
              setTimeout(() => {
                editor?.commands.focus();
              }, 10);
            }
            setShowCommandMenu(false);
            return true;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setShowCommandMenu(false);
            return true;
          }
          if (event.key === "Backspace") {
            event.preventDefault();
            setCommandSearch((prev) => prev.slice(0, -1));
            return true;
          }
          if (/^[a-zA-Z0-9]$/.test(event.key)) {
            event.preventDefault();
            setCommandSearch((prev) => prev + event.key);
            return true;
          }
          return true;
        }

        const { $from } = view.state.selection;
        const node = $from.node();

        if (node.type.name === "listItem") {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if ($from.parent.textContent.trim() === "") {
              editor?.chain().focus().liftListItem("listItem").run();
            } else {
              editor?.chain().focus().splitListItem("listItem").run();
            }
            return true;
          }
          if (["Backspace", "Escape"].includes(event.key)) {
            if ($from.parent.textContent.trim() === "") {
              event.preventDefault();
              editor?.chain().focus().liftListItem("listItem").run();
              return true;
            }
          }
        }

        if (event.key === "/" && !showCommandMenu) {
          event.preventDefault();
          setShowCommandMenu(true);
          setSelectedIndex(0);
          setCommandSearch("");
          if (editor) {
            updateMenuPosition(editor);
          }
          return true;
        }
        return false;
      },
    },
  });

  // Define onDrop callback for media uploads
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
          const isAudio = file.type.startsWith("audio/");

          // Only accept files that match the current media type
          if (mediaType === "image" && !isImage) {
            toast({
              title: "Unsupported file type",
              description: "Only image files are supported for this upload",
              variant: "destructive",
            });
            return null;
          } else if (mediaType === "video" && !isVideo) {
            toast({
              title: "Unsupported file type",
              description: "Only video files are supported for this upload",
              variant: "destructive",
            });
            return null;
          } else if (mediaType === "audio" && !isAudio) {
            toast({
              title: "Unsupported file type",
              description: "Only audio files are supported for this upload",
              variant: "destructive",
            });
            return null;
          }

          // Check file size
          const maxSize = isImage
            ? 4 * 1024 * 1024
            : isVideo
              ? 64 * 1024 * 1024
              : 16 * 1024 * 1024; // 4MB for images, 64MB for videos, 16MB for audio
          if (file.size > maxSize) {
            toast({
              title: "File too large",
              description: `${isImage ? "Images must be under 4MB" : isVideo ? "Videos must be under 64MB" : "Audio files must be under 16MB"}`,
              variant: "destructive",
            });
            return null;
          }

          let type = "";
          const previewUrl = URL.createObjectURL(file);

          if (isImage) {
            type = "image";
          } else if (isVideo) {
            type = "video";
          } else if (isAudio) {
            type = "audio";
          } else {
            return null; // Shouldn't happen due to earlier check
          }

          return {
            file,
            previewUrl,
            type,
            uploading: false,
            progress: 0,
          } as MediaFile;
        })
        .filter(Boolean) as MediaFile[];

      setMediaFiles((prev) => [...prev, ...newMediaFiles]);
    },
    [mediaFiles.length, toast],
  );

  // Define dropzone hook
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      mediaType === "image"
        ? {
            "image/*": [".png", ".jpg", ".jpeg", ".gif"],
          }
        : mediaType === "video"
          ? {
              "video/*": [".mp4", ".webm", ".mov"],
            }
          : {
              "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
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

  // Function to insert media into the editor
  const insertMediaToEditor = useCallback(
    (src: string, type: "image" | "video" | "audio") => {
      if (!editor?.isEditable) return;

      try {
        // First try to insert at current position with proper error handling
        editor
          .chain()
          .focus()
          .insertContent({
            type: "mediaNode",
            attrs: {
              src,
              type,
            },
          })
          // Add a new paragraph after the media to allow continued typing
          .insertContent({ type: "paragraph" })
          .run();
      } catch (_insertError) {
        // Error is intentionally ignored
        // Handle error inserting media at current position

        // Fallback: Try to insert at the end of the document
        try {
          // Move to the end of the document and insert content
          editor
            .chain()
            .focus()
            // Move cursor to the end of the document
            // Simply focus the editor and append content at current position
            .focus()
            .insertContent({
              type: "mediaNode",
              attrs: {
                src,
                type,
              },
            })
            // Add a new paragraph after the media
            .insertContent({ type: "paragraph" })
            .run();
        } catch (_fallbackError) {
          // Silently handle error and continue with last resort approach
          // Last resort: Create a new paragraph and insert there
          try {
            editor
              .chain()
              .focus()
              // Move cursor to the end of the document
              // Simply focus the editor and append content at current position
              .focus()
              .insertContent({
                type: "mediaNode",
                attrs: {
                  src,
                  type,
                },
              })
              // Add a new paragraph after the media
              .insertContent({ type: "paragraph" })
              .run();
          } catch (_lastError) {
            // Silently handle the error when all insertion attempts fail
          }
        }
      }
    },
    [editor],
  );

  const confirmMediaSelection = () => {
    if (!editor?.isEditable) {
      setShowMediaPrompt(false);
      return;
    }

    // Insert each media file into the editor
    // Use a slight delay between insertions to ensure proper handling
    if (mediaFiles.length > 0) {
      // Insert the first media file immediately
      const firstMedia = mediaFiles[0];
      insertMediaToEditor(firstMedia.previewUrl, firstMedia.type);

      // Insert any remaining media files with a slight delay
      if (mediaFiles.length > 1) {
        mediaFiles.slice(1).forEach((media, index) => {
          setTimeout(
            () => {
              insertMediaToEditor(media.previewUrl, media.type);
            },
            (index + 1) * 100,
          ); // 100ms delay between insertions
        });
      }
    }

    // Also pass the files to the parent component if needed
    if (mediaFiles.length > 0 && onMediaSelect) {
      onMediaSelect(mediaFiles.map((mf) => mf.file));
    }

    setShowMediaPrompt(false);
  };

  const cancelMediaSelection = () => {
    setMediaFiles((prev) => {
      prev.forEach((file) => URL.revokeObjectURL(file.previewUrl));
      return [];
    });
    setShowMediaPrompt(false);
  };

  const applyFormat = (command: { id: string; label: string }) => {
    if (!editor) return;

    // Ensure editor is focused before applying format
    editor.commands.focus();

    // Get the current node
    const node = editor.state.selection.$head.parent;
    const isEmpty = node.content.size === 0;

    switch (command.id) {
      case "text":
        editor.chain().focus().clearNodes().setParagraph().run();
        break;
      case "h1":
        editor.chain().focus().clearNodes().setHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().clearNodes().setHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().clearNodes().setHeading({ level: 3 }).run();
        break;
      case "bullet":
        if (editor.isActive("bulletList")) {
          editor.chain().focus().liftListItem("listItem").run();
        } else {
          editor.chain().focus().clearNodes().wrapInList("bulletList").run();
        }
        break;
      case "numbered":
        if (editor.isActive("orderedList")) {
          editor.chain().focus().liftListItem("listItem").run();
        } else {
          editor.chain().focus().clearNodes().wrapInList("orderedList").run();
        }
        break;
      case "quote":
        // Set blockquote with italic styling
        editor
          .chain()
          .focus()
          .clearNodes()
          .setBlockquote()
          .setMark("italic")
          .run();
        break;
      case "code":
        editor.chain().focus().clearNodes().setCodeBlock().run();
        break;
      case "divider":
        // Insert a horizontal rule that spans the full width
        editor
          .chain()
          .focus()
          .setHorizontalRule()
          // Add an empty paragraph after to ensure there's a valid cursor position
          .insertContent("<p></p>")
          .run();
        break;
      case "link":
        setLinkUrl("");
        setShowLinkPrompt(true);
        return;
      case "image":
        setMediaType("image");
        setMediaTab("upload");
        setShowMediaPrompt(true);
        return;
      case "video":
        setMediaType("video");
        setMediaTab("upload");
        setShowMediaPrompt(true);
        return;
      case "audio":
        setMediaType("audio");
        setMediaTab("upload");
        setShowMediaPrompt(true);
        return;
    }

    // Move cursor to start if current node is empty or if switching to a new block type
    // Skip this for divider which doesn't need cursor positioning
    if (
      command.id !== "divider" &&
      (isEmpty ||
        node.type.name !== editor.state.selection.$head.parent.type.name)
    ) {
      try {
        const pos = editor.state.selection.$head.before();
        editor.commands.setTextSelection(pos);
      } catch {
        // Silently handle positioning errors without logging
      }
    }
  };

  const confirmLink = () => {
    if (!editor || !linkUrl.trim()) {
      setShowLinkPrompt(false);
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl.trim() })
      .run();
    setShowLinkPrompt(false);
    setLinkUrl("");
  };

  const cancelLink = () => {
    setShowLinkPrompt(false);
    setLinkUrl("");
  };

  React.useImperativeHandle(ref, () => ({
    clearEditor: () => {
      if (editor) {
        editor.commands.clearContent(true);
      }
    },
    insertEmoji: (emoji: string) => {
      if (editor) {
        editor.commands.insertContent(emoji);
      }
    },
  }));

  return (
    <div className="w-full">
      <div className="relative">
        {/* Character counter */}
        <div className={cn(
          "text-xs text-right mb-1",
          charCount > maxLength ? "text-destructive font-medium" : "text-muted-foreground"
        )}>
          {charCount}/{maxLength} characters
        </div>
        <div className="relative grow">
          <EditorContent
            editor={editor}
            className={cn(
              "w-full min-h-[150px]",
              "focus-within:outline-none",
              "rounded-lg",
              "prose prose-sm dark:prose-invert max-w-none",
              // Add border color based on character count
              charCount > maxLength ? "border-2 border-destructive" : "",
              // Unified text color
              "[--tw-prose-body:var(--foreground)]",
              "[--tw-prose-headings:var(--foreground)]",
              "[--tw-prose-lead:var(--foreground)]",
              "[--tw-prose-links:var(--foreground)]",
              "[--tw-prose-bold:var(--foreground)]",
              "[--tw-prose-counters:var(--foreground)]",
              "[--tw-prose-bullets:var(--foreground)]",
              "[--tw-prose-quotes:var(--foreground)]",
              "[--tw-prose-quote-borders:var(--border)]",
              "[--tw-prose-captions:var(--foreground)]",
              "[--tw-prose-code:var(--foreground)]",
              "[--tw-prose-pre-code:var(--foreground)]",
              "[--tw-prose-pre-bg:var(--background)]",
              "[--tw-prose-th-borders:var(--border)]",
              "[--tw-prose-td-borders:var(--border)]",
              // Compact spacing
              "[&_p]:mt-[0.5em] [&_p]:mb-[0.5em]",
              "[&_h1]:mt-[0.5em] [&_h1]:mb-[0.5em]",
              "[&_h2]:mt-[0.5em] [&_h2]:mb-[0.5em]",
              "[&_h3]:mt-[0.5em] [&_h3]:mb-[0.5em]",
              "[&_ul]:mt-[0.5em] [&_ul]:mb-[0.5em]",
              "[&_ol]:mt-[0.5em] [&_ol]:mb-[0.5em]",
              "[&_blockquote]:mt-[0.5em] [&_blockquote]:mb-[0.5em]",
              "[&_pre]:mt-[0.5em] [&_pre]:mb-[0.5em]",
              // Add specific styling for horizontal rule to override prose defaults
              "[&_hr]:mt-[1.5em] [&_hr]:mb-[1.5em] [&_hr]:border-t [&_hr]:border-muted-foreground/30",
              // Add specific styling for callout to ensure it's not affected by prose margins
              "[&_.callout]:!my-2 [&_.callout]:!mt-[0.5em] [&_.callout]:!mb-[0.5em]",
              "[&_.callout]:bg-zinc-700/50 [&_.callout]:backdrop-blur-sm",
              // Existing styles
              "[&_*]:!text-foreground [&_*]:!opacity-100", // Optional fallback
              "[&_p]:text-base [&_ul]:text-base [&_ol]:text-base",
              "p-4",
              "bg-zinc-800/70 dark:bg-zinc-800/70",
              "border border-zinc-700/50 dark:border-zinc-700/50",
              "[&_.ProseMirror]:min-h-[120px]",
              "[&_p]:leading-6",
              "[&_h1]:leading-8",
              "[&_h2]:leading-7",
              "[&_h3]:leading-6",
              // Placeholder styles (kept distinct)
              "[&_.ProseMirror_p.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_p.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_p.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_p.is-empty::before]:float-left",
              "[&_.ProseMirror_p.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_p.is-empty::before]:h-0",
              "[&_.ProseMirror_h1.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_h1.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_h1.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_h1.is-empty::before]:float-left",
              "[&_.ProseMirror_h1.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_h2.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_h2.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_h2.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_h2.is-empty::before]:float-left",
              "[&_.ProseMirror_h2.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_h3.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_h3.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_h3.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_h3.is-empty::before]:float-left",
              "[&_.ProseMirror_h3.is-empty::before]:pointer-events-none",
            )}
          />
        </div>

        {showCommandMenu && (
          <div
            className="absolute z-50 w-72"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            <Command className="rounded-lg border bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
              <CommandInput
                value={commandSearch}
                onValueChange={setCommandSearch}
                placeholder="/Filter..."
                onKeyDown={(e) => {
                  // Handle space key for selection when typing in the input
                  if (e.key === " " && filteredCommands.length > 0 && commandSearch.trim()) {
                    e.preventDefault();
                    const selectedCommand = filteredCommands[selectedIndex];
                    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                    if (selectedCommand) {
                      applyFormat(selectedCommand);
                      setShowCommandMenu(false);
                    }
                  }
                }}
              />
              <CommandList>
                <CommandEmpty className="p-2 text-sm text-gray-500 dark:text-gray-400">
                  No results found.
                </CommandEmpty>
                <CommandGroup>
                  {filteredCommands.map((command, index) => (
                    <CommandItem
                      key={command.id}
                      onMouseEnter={() => setSelectedIndex(index)}
                      onSelect={() => {
                        // Apply format and close menu when selected
                        applyFormat(command);
                        setShowCommandMenu(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 text-sm text-gray-900 dark:text-gray-100",
                        "hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors",
                        "cursor-pointer",
                        selectedIndex === index
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "",
                      )}
                    >
                      <span className="w-6 flex-none text-center">
                        {command.icon}
                      </span>
                      <span>{command.label}</span>
                      <kbd className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                        {command.id}
                      </kbd>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        )}

        {showLinkPrompt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                cancelLink();
              }
            }}
          >
            <div className="w-[400px] max-w-[90vw] rounded-lg border bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-3 text-lg font-medium">Add Link</h3>
              <div className="mb-4">
                <label
                  htmlFor="link-url"
                  className="mb-2 block text-sm font-medium"
                >
                  URL
                </label>
                <input
                  id="link-url"
                  type="url"
                  className="w-full rounded-md border p-2 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.preventDefault();
                      cancelLink();
                    } else if (e.key === "Enter" && linkUrl.trim()) {
                      e.preventDefault();
                      confirmLink();
                    }
                  }}
                  autoFocus
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter the full URL including http:// or https://
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={cancelLink}>
                  Cancel
                </Button>
                <Button onClick={confirmLink} disabled={!linkUrl.trim()}>
                  Add Link
                </Button>
              </div>
            </div>
          </div>
        )}

        {showMediaPrompt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                cancelMediaSelection();
              }
            }}
          >
            <div className="w-[500px] max-w-[90vw] rounded-lg border bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <h3 className="mb-3 text-lg font-medium">
                {mediaType === "image"
                  ? "Add Image"
                  : mediaType === "video"
                    ? "Add Video"
                    : "Add Audio"}
              </h3>

              {/* Tabs */}
              <div className="mb-4 flex border-b">
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    mediaTab === "upload"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setMediaTab("upload")}
                >
                  Upload
                </button>
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    mediaTab === "embed"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setMediaTab("embed")}
                >
                  Embed link
                </button>
              </div>

              {mediaTab === "upload" ? (
                <>
                  {/* Media Preview Section */}
                  {mediaFiles.length > 0 && (
                    <div
                      className={cn(
                        "mb-4 grid gap-2",
                        mediaFiles.length === 1 ? "grid-cols-1" : "grid-cols-2",
                      )}
                    >
                      {mediaFiles.map((media, index) => (
                        <div
                          key={index}
                          className="group relative overflow-hidden rounded-md bg-muted/50"
                          style={{
                            aspectRatio:
                              media.type === "image" ? "16/9" : "16/9",
                          }}
                        >
                          {media.type === "image" ? (
                            <Image
                              src={media.previewUrl}
                              alt="Media preview"
                              fill
                              className="object-cover"
                            />
                          ) : media.type === "video" ? (
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
                          ) : (
                            <div className="relative flex size-full items-center justify-center bg-gray-100 dark:bg-gray-800">
                              <audio
                                src={media.previewUrl}
                                controls={!media.uploading}
                                className="w-full px-4"
                              />
                            </div>
                          )}

                          {/* Upload Progress Indicator */}
                          {media.uploading && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50">
                              <Loader2 className="mb-2 size-8 animate-spin text-primary" />
                              <Progress
                                value={media.progress}
                                className="h-2 w-3/4"
                              />
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
                            disabled={isUploading}
                          >
                            <X className="size-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Dropzone Area */}
                  {mediaFiles.length < 4 && !isUploading && (
                    <div
                      {...getRootProps()}
                      className={cn(
                        "mb-4 cursor-pointer rounded-md border-2 border-dashed p-4 transition-colors",
                        isDragActive
                          ? "border-primary bg-primary/5"
                          : "border-muted-foreground/20 hover:border-muted-foreground/50",
                      )}
                    >
                      <input {...getInputProps()} />
                      <div className="flex flex-col items-center justify-center text-sm text-muted-foreground">
                        <ImagePlus className="mb-2 size-6" />
                        <p>
                          {isDragActive
                            ? "Drop files here"
                            : `Drag & drop or click to add ${mediaType === "image" ? "images" : mediaType === "video" ? "videos" : "audio files"}`}
                        </p>
                        <p className="mt-1 text-xs">
                          {mediaType === "image"
                            ? "Up to 4 files (4MB per image)"
                            : mediaType === "video"
                              ? "Up to 4 files (64MB per video)"
                              : "Up to 4 files (16MB per audio file)"}
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
                    id="embed-url"
                    type="url"
                    className="w-full rounded-md border p-2 text-base focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-gray-700 dark:bg-gray-800"
                    placeholder={
                      mediaType === "image"
                        ? "https://example.com/image.jpg"
                        : mediaType === "video"
                          ? "https://youtube.com/watch?v=..."
                          : "https://example.com/audio.mp3"
                    }
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelMediaSelection();
                      } else if (e.key === "Enter" && embedUrl.trim()) {
                        e.preventDefault();
                        // Handle embed URL based on media type
                        insertMediaToEditor(
                          embedUrl,
                          mediaType as "image" | "video" | "audio",
                        );
                        setShowMediaPrompt(false);
                        setEmbedUrl("");
                      }
                    }}
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mediaType === "image"
                      ? "Enter the full image URL"
                      : mediaType === "video"
                        ? "Works with YouTube, Vimeo, and more"
                        : "Enter the full audio URL"}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={cancelMediaSelection}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={
                    mediaTab === "upload"
                      ? confirmMediaSelection
                      : () => {
                          if (embedUrl.trim()) {
                            // Handle embed URL based on media type
                            insertMediaToEditor(
                              embedUrl,
                              mediaType as "image" | "video",
                            );
                            setShowMediaPrompt(false);
                            setEmbedUrl("");
                          }
                        }
                  }
                  disabled={
                    (mediaTab === "upload" && mediaFiles.length === 0) ||
                    (mediaTab === "embed" && !embedUrl.trim()) ||
                    isUploading
                  }
                >
                  {mediaTab === "upload"
                    ? `Add ${mediaType === "image" ? "Image" : mediaType === "video" ? "Video" : "Audio"}`
                    : `Embed ${mediaType === "image" ? "Image" : mediaType === "video" ? "Video" : "Audio"}`}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
