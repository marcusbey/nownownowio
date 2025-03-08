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
};

const RichTextEditor = React.forwardRef<
  { clearEditor: () => void },
  RichTextEditorProps
>(({ onChange, onEmojiSelect, onMediaSelect }, ref) => {
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [commandSearch, setCommandSearch] = React.useState("");
  const menuRef = React.useRef<HTMLDivElement>(null);
  const formatCommands = [
    { id: "text", label: "Text", icon: "¶", keywords: ["text", "paragraph"] },
    { id: "h1", label: "Heading 1", icon: "H1", keywords: ["heading", "title", "h1"] },
    { id: "h2", label: "Heading 2", icon: "H2", keywords: ["heading", "subtitle", "h2"] },
    { id: "h3", label: "Heading 3", icon: "H3", keywords: ["heading", "subtitle", "h3"] },
    { id: "bullet", label: "Bullet List", icon: "•", keywords: ["bullet", "list", "unordered"] },
    { id: "numbered", label: "Numbered List", icon: "1.", keywords: ["numbered", "list", "ordered"] },
    { id: "quote", label: "Quote", icon: '"', keywords: ["quote", "blockquote", "citation"] },
    { id: "code", label: "Code Block", icon: "<>", keywords: ["code", "codeblock", "programming"] },
    { id: "link", label: "Link", icon: "🔗", keywords: ["link", "url", "hyperlink"] },
    { id: "image", label: "Image", icon: "🖼️", keywords: ["image", "picture", "photo", "media"] },
    { id: "video", label: "Video", icon: "🎬", keywords: ["video", "movie", "clip", "media"] },
    { id: "audio", label: "Audio", icon: "🔊", keywords: ["audio", "sound", "music", "media"] },
  ];

  const [showCommandMenu, setShowCommandMenu] = React.useState(false);
  const [showLinkPrompt, setShowLinkPrompt] = React.useState(false);
  const [showMediaPrompt, setShowMediaPrompt] = React.useState(false);
  const [mediaType, setMediaType] = React.useState<"image" | "video" | "audio">("image");
  const [mediaTab, setMediaTab] = React.useState<"upload" | "embed">("upload");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [embedUrl, setEmbedUrl] = React.useState("");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  /**
   * Filters commands based on the input search string.
   * Handles multi-word searches by skipping non-matching words and filtering based on matching words.
   */
  const filteredCommands = React.useMemo(() => {
    const searchWords = commandSearch.trim().toLowerCase().split(/\s+/);
    if (searchWords.length === 0 || !commandSearch.trim())
      return formatCommands;

    // Find the first word that matches any command
    let startIndex = -1;
    for (let i = 0; i < searchWords.length; i++) {
      const word = searchWords[i];
      const matches = formatCommands.some((cmd) => {
        const cmdText = `${cmd.id} ${cmd.label}`.toLowerCase();
        if (cmdText.includes(word)) return true;
        
        // Also check keywords
        if (cmd.keywords) {
          return cmd.keywords.some(keyword => keyword.toLowerCase().includes(word));
        }
        
        return false;
      });
      if (matches) {
        startIndex = i;
        break;
      }
    }

    // If no word matches, return empty array
    if (startIndex === -1) return [];

    // Filter commands based on all words from the first matching word
    const relevantWords = searchWords.slice(startIndex);
    return formatCommands.filter((cmd) => {
      // Check command text (id and label)
      const cmdText = `${cmd.id} ${cmd.label}`.toLowerCase();
      
      // Check if all search words match the command text
      const matchesCommandText = relevantWords.every((word) => cmdText.includes(word));
      if (matchesCommandText) return true;
      
      // Check if command has keywords and if any keyword matches the search
      if (cmd.keywords) {
        // For each search word, check if any keyword contains it
        return relevantWords.every(word => {
          return cmd.keywords.some(keyword => keyword.toLowerCase().includes(word));
        });
      }
      
      return false;
    });
  }, [commandSearch]);

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
      }),
      MediaNode,
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "paragraph") {
            return 'Press "/" for commands...';
          }
          return "";
        },
        className:
          "text-muted-foreground/30 select-none text-sm font-light italic",
        placeholder: ({ node, editor }) => {
          const doc = editor.state.doc;
          const isFirstChild = doc.firstChild && doc.firstChild.eq(node);

          if (isFirstChild && node.type.name === "paragraph") {
            return "What's on your mind? Type '/' for formatting...";
          }

          switch (node.type.name) {
            case "heading":
              switch (node.attrs.level) {
                case 1:
                  return "Type heading 1...";
                case 2:
                  return "Type heading 2...";
                case 3:
                  return "Type heading 3...";
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
        showCursor: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
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
          updateMenuPosition(editor);
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
          const maxSize = isImage ? 4 * 1024 * 1024 : 
                         isVideo ? 64 * 1024 * 1024 : 
                         16 * 1024 * 1024; // 4MB for images, 64MB for videos, 16MB for audio
          if (file.size > maxSize) {
            toast({
              title: "File too large",
              description: `${isImage ? "Images must be under 4MB" : isVideo ? "Videos must be under 64MB" : "Audio files must be under 16MB"}`,
              variant: "destructive",
            });
            return null;
          }

          let type = "";
          let previewUrl = URL.createObjectURL(file);
          
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
    accept: mediaType === "image" ? {
      "image/*": [".png", ".jpg", ".jpeg", ".gif"],
    } : mediaType === "video" ? {
      "video/*": [".mp4", ".webm", ".mov"],
    } : {
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
  const insertMediaToEditor = useCallback((src: string, type: "image" | "video" | "audio") => {
    if (!editor || !editor.isEditable) return;
    
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
    } catch (error) {
      console.error("Error inserting media at current position:", error);
      
      // Fallback: Try to insert at the end of the document
      try {
        editor
          .chain()
          .selectEnd()
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
      } catch (fallbackError) {
        console.error("Fallback insertion failed:", fallbackError);
        // Last resort: Create a new paragraph and insert there
        try {
          editor
            .chain()
            .selectEnd()
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
        } catch (lastError) {
          console.error("All insertion attempts failed:", lastError);
        }
      }
    }
  }, [editor]);

  const confirmMediaSelection = () => {
    if (!editor || !editor.isEditable) {
      setShowMediaPrompt(false);
      return;
    }
    
    // Insert each media file into the editor
    // Use a slight delay between insertions to ensure proper handling
    if (mediaFiles.length > 0) {
      // Insert the first media file immediately
      const firstMedia = mediaFiles[0];
      insertMediaToEditor(firstMedia.previewUrl, firstMedia.type as "image" | "video" | "audio");
      
      // Insert any remaining media files with a slight delay
      if (mediaFiles.length > 1) {
        mediaFiles.slice(1).forEach((media, index) => {
          setTimeout(() => {
            insertMediaToEditor(media.previewUrl, media.type as "image" | "video" | "audio");
          }, (index + 1) * 100); // 100ms delay between insertions
        });
      }
    }
    
    // Also pass the files to the parent component if needed
    if (mediaFiles.length > 0 && onMediaSelect) {
      onMediaSelect(mediaFiles.map(mf => mf.file));
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
        editor.chain().focus().clearNodes().setBlockquote().run();
        break;
      case "code":
        editor.chain().focus().clearNodes().setCodeBlock().run();
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
    if (
      isEmpty ||
      node.type.name !== editor.state.selection.$head.parent.type.name
    ) {
      const pos = editor.state.selection.$head.before();
      editor.commands.setTextSelection(pos);
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
        <div className="relative grow">
          <EditorContent
            editor={editor}
            className={cn(
              "w-full min-h-[150px]",
              "focus-within:outline-none",
              "rounded-lg",
              "prose prose-sm dark:prose-invert max-w-none",
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
                      onMouseDown={(e) => {
                        e.preventDefault();
                        applyFormat(command);
                        setShowCommandMenu(false);
                      }}
                      className={cn(
                        "flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer text-gray-900 dark:text-gray-100",
                        selectedIndex === index
                          ? "bg-gray-100 dark:bg-gray-800"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
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
                <label htmlFor="link-url" className="mb-2 block text-sm font-medium">URL</label>
                <input
                  id="link-url"
                  type="url"
                  className="w-full rounded-md border p-2 text-base dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
                <p className="mt-1 text-xs text-muted-foreground">Enter the full URL including http:// or https://</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={cancelLink}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmLink}
                  disabled={!linkUrl.trim()}
                >
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
                {mediaType === "image" ? "Add Image" : mediaType === "video" ? "Add Video" : "Add Audio"}
              </h3>
              
              {/* Tabs */}
              <div className="mb-4 flex border-b">
                <button
                  className={cn(
                    "px-4 py-2 text-sm font-medium",
                    mediaTab === "upload"
                      ? "border-b-2 border-primary text-primary"
                      : "text-muted-foreground hover:text-foreground"
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
                      : "text-muted-foreground hover:text-foreground"
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
                            aspectRatio: media.type === "image" ? "16/9" : "16/9",
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
                            <div className="relative size-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
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
                              <Progress value={media.progress} className="h-2 w-3/4" />
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
                          {mediaType === "image" ? "Up to 4 files (4MB per image)" : 
                           mediaType === "video" ? "Up to 4 files (64MB per video)" : 
                           "Up to 4 files (16MB per audio file)"}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="mb-4">
                  <label htmlFor="embed-url" className="mb-2 block text-sm font-medium">
                    {mediaType === "image" ? "Image URL" : mediaType === "video" ? "Video URL" : "Audio URL"}
                  </label>
                  <input
                    id="embed-url"
                    type="url"
                    className="w-full rounded-md border p-2 text-base dark:border-gray-700 dark:bg-gray-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder={mediaType === "image" ? "https://example.com/image.jpg" : 
                               mediaType === "video" ? "https://youtube.com/watch?v=..." : 
                               "https://example.com/audio.mp3"}
                    value={embedUrl}
                    onChange={(e) => setEmbedUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") {
                        e.preventDefault();
                        cancelMediaSelection();
                      } else if (e.key === "Enter" && embedUrl.trim()) {
                        e.preventDefault();
                        // Handle embed URL based on media type
                        insertMediaToEditor(embedUrl, mediaType as "image" | "video" | "audio");
                        setShowMediaPrompt(false);
                        setEmbedUrl("");
                      }
                    }}
                    autoFocus
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {mediaType === "image" ? "Enter the full image URL" : 
                     mediaType === "video" ? "Works with YouTube, Vimeo, and more" : 
                     "Enter the full audio URL"}
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
                  onClick={mediaTab === "upload" ? confirmMediaSelection : () => {
                    if (embedUrl.trim()) {
                      // Handle embed URL based on media type
                      insertMediaToEditor(embedUrl, mediaType as "image" | "video");
                      setShowMediaPrompt(false);
                      setEmbedUrl("");
                    }
                  }}
                  disabled={(mediaTab === "upload" && mediaFiles.length === 0) || 
                           (mediaTab === "embed" && !embedUrl.trim()) || 
                           isUploading}
                >
                  {mediaTab === "upload" ? `Add ${mediaType === "image" ? "Image" : mediaType === "video" ? "Video" : "Audio"}` : 
                   `Embed ${mediaType === "image" ? "Image" : mediaType === "video" ? "Video" : "Audio"}`}
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
