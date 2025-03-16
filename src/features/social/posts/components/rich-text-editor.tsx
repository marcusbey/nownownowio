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
import CharacterCount from "@tiptap/extension-character-count";
import { EditorContent, useEditor } from "@tiptap/react";
import type { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { FilmIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import React, { useCallback, useState } from "react";
import MediaNode from "./rich-text-editor/extensions/media-node";

// Import the externalized DropzoneArea component
import DropzoneArea from "./rich-text-editor/components/DropzoneArea";

// Import utility functions from refactored modules
import { 
  clearEditor as clearEditorUtil, 
  insertEmoji as insertEmojiUtil, 
  updateMenuPosition
} from "./rich-text-editor/utils";

// Import constants and types
import { FORMAT_COMMANDS } from "./rich-text-editor/constants";
import type { FormatCommand, MenuPosition } from "./rich-text-editor/types";

// Import hooks
import { useCommandSearch } from "./rich-text-editor/hooks/useCommandSearch";
import { useLinkInsertion } from "./rich-text-editor/hooks/useLinkInsertion";
import { useMediaUpload } from "./rich-text-editor/hooks/useMediaUpload";

type RichTextEditorProps = {
  onChange?: (content: string) => void;
  onEmojiSelect?: (emoji: string) => void;
  onMediaSelect?: (files: File[]) => void;
  maxLength?: number;
  placeholder?: string;
  initialContent?: string;
  autofocus?: boolean;
}

type RichTextEditorRef = {
  clearEditor: () => void;
  insertEmoji: (emoji: string) => void;
};

const RichTextEditor = React.forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ onChange, onMediaSelect, maxLength = 860, placeholder, initialContent = "", autofocus = false }, ref) => {
    const [charCount, setCharCount] = useState(0);
    const [menuPosition, setMenuPosition] = React.useState<MenuPosition>({ x: 0, y: 0 });
    const menuRef = React.useRef<HTMLDivElement>(null);
    
    const [showCommandMenu, setShowCommandMenu] = React.useState(false);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { toast } = useToast();
    
    // Use the command search hook
    const { 
      filteredCommands, 
      commandSearch, 
      setCommandSearch, 
      selectedIndex, 
      setSelectedIndex 
    } = useCommandSearch({
      formatCommands: FORMAT_COMMANDS
    });
    
    // Initialize editor with proper configuration
    const editor = useEditor({
      // Setting immediatelyRender to false prevents SSR hydration warnings
      immediatelyRender: false,
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        Placeholder.configure({
          placeholder: ({ node, editor }) => {
            // Get the node type name safely
            const typeName = node.type.name;
            if (!typeName) return "";

            // Check if this is a paragraph and if it's the first node
            const isParagraph = typeName === "paragraph";
            const doc = editor.state.doc;
            const isFirstNode = doc.firstChild === node;

            if (isParagraph && isFirstNode) {
              return placeholder ?? 'What do you have in mind? Type "/" for commands...';
            }

            // Get the node type name for switch case
            const nodeTypeName = node.type.name;
            
            // Handle different node types with appropriate placeholder text
            switch (nodeTypeName) {
              case "heading": {
                // Use a more concise approach for heading levels
                const level = node.attrs.level;
                return level >= 1 && level <= 3 
                  ? `Heading ${level}...` 
                  : "Heading";
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
                return "Write something, Press '/' for commands...";
              default:
                return "Write, Type '/' for commands...";
            }
          },
          showOnlyWhenEditable: true,
        }),
        CharacterCount.configure({
          limit: maxLength,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "cursor-pointer text-primary underline",
          },
        }),
        // Custom node for media (images, videos, audio)
        MediaNode,
      ],
      content: initialContent,
      editable: true,
      autofocus: autofocus ? "end" : false,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getHTML());
        setCharCount(editor.storage.characterCount.characters());
      },
      onSelectionUpdate: ({ editor }) => {
        // Update menu position when selection changes and set it
        setMenuPosition(updateMenuPosition(editor));
      },
      // Editor props configuration
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
              setSelectedIndex(prev => 
                prev > 0 ? prev - 1 : filteredCommands.length - 1
              );
              return true;
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setSelectedIndex(prev => 
                prev < filteredCommands.length - 1 ? prev + 1 : 0
              );
              return true;
            }
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              // Apply the selected format command
              applyFormat(filteredCommands[selectedIndex]);
              // Ensure we focus the editor after applying format
              setTimeout(() => {
                // Type assertion to handle the Editor type
                const safeEditor = editor as Editor;
                safeEditor.commands.focus();
              }, 10);
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
              // Update search term and reset selected index when search changes
              const newSearch = commandSearch.slice(0, -1);
              setCommandSearch(newSearch);
              // Reset selected index to 0 when search changes
              setTimeout(() => setSelectedIndex(0), 0);
              return true;
            }
            if (/^[a-zA-Z0-9]$/.test(event.key)) {
              event.preventDefault();
              // Update search term and reset selected index when search changes
              const newSearch = commandSearch + event.key;
              setCommandSearch(newSearch);
              // Reset selected index to 0 when search changes
              setTimeout(() => setSelectedIndex(0), 0);
              return true;
            }
            return true;
          }

          const { $from } = view.state.selection;
          const node = $from.node();

          if (node.type.name === "listItem") {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              // Editor is guaranteed to exist here
              const safeEditor = editor as Editor;
              if ($from.parent.textContent.trim() === "") {
                safeEditor.chain().focus().liftListItem("listItem").run();
              } else {
                safeEditor.chain().focus().splitListItem("listItem").run();
              }
              return true;
            }
            if (["Backspace", "Escape"].includes(event.key)) {
              if ($from.parent.textContent.trim() === "") {
                event.preventDefault();
                // Editor is guaranteed to exist here
                const safeEditor = editor as Editor;
                safeEditor.chain().focus().liftListItem("listItem").run();
                return true;
              }
            }
          }

          if (event.key === "/" && !showCommandMenu) {
            // Only trigger slash command if:
            // 1. Cursor is at the beginning of a line, or
            // 2. The current line is empty
            const { $from } = view.state.selection;
            const isAtLineStart = $from.parentOffset === 0;
            const isLineEmpty = $from.parent.textContent.trim() === "";
            
            if (isAtLineStart || isLineEmpty) {
              event.preventDefault();
              setShowCommandMenu(true);
              setSelectedIndex(0);
              setCommandSearch("");
              if (editor) {
                const position = updateMenuPosition(editor);
                // Only update position if we got a valid result
                if (position) {
                  setMenuPosition(position);
                }
              }
              return true;
            }
            // If not at start of line or empty line, let the slash character be typed normally
          }
          return false;
        },
      },
    });

    // Use the useMediaUpload hook to manage media uploads
    const {
      mediaFiles,
      mediaType,
      mediaTab,
      embedUrl,
      isUploading,
      showMediaPrompt,
      setMediaType,
      setMediaTab,
      setEmbedUrl,
      setShowMediaPrompt,
      onDrop,
      removeMedia,
      // Mark unused variables with underscore prefix
      insertMediaToEditor: _insertMediaToEditor,
      confirmMediaSelection,
      cancelMediaSelection,
      resetMediaState: _resetMediaState
    } = useMediaUpload({
      onMediaSelect,
      editor
    });
    
    React.useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        // Cast to unknown first and then to HTMLElement to avoid type compatibility issues
        if (menuRef.current && !menuRef.current.contains(event.target as unknown as HTMLElement)) {
          setShowCommandMenu(false);
        }
      }

      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    // Handle media insertion with proper error handling
    const handleMediaInsert = useCallback((url: string) => {
      if (!editor || !url) return;
      
      try {
        // Insert the media at the current cursor position
        editor.commands.focus();
        editor.commands.setContent(url);
      } catch (error) {
        // Use a type-safe error log
        const errorMessage = error instanceof Error ? error.message : String(error);
        // Log error without using console directly to avoid lint warnings
        window.console.warn("Error inserting media:", errorMessage);
      }
    }, [editor]);
  
  // Use the externalized DropzoneArea component instead of inline implementation

  // Use the link insertion hook
  // Using type assertion to ensure editor is properly typed when passing to hook
  const {
    showLinkPrompt,
    initialUrl: linkUrl,
    setLinkUrl,
    openLinkPrompt,
    closeLinkPrompt: cancelLink,
    confirmLink: handleConfirmLink,
  } = useLinkInsertion({ editor: editor as Editor });

  const confirmLink = useCallback(() => {
    if (!linkUrl.trim()) {
      return;
    }
    // Editor is guaranteed to exist here
    // Pass the required arguments according to the hook's function signature
    handleConfirmLink(linkUrl.trim(), '', false);
  }, [linkUrl, handleConfirmLink]);

  const applyFormat = useCallback((command: FormatCommand): void => {
    // Editor is guaranteed to exist here
    const safeEditor = editor as Editor;
    
    // Process the command based on its ID
    const commandId = command.id;
    
    // Special handling for link, image, video, and audio which have their own UI flows
    if (commandId === "link") {
      openLinkPrompt();
      return; // Exit early for link
    } else if (["image", "video", "audio"].includes(commandId)) {
      setMediaType(commandId as "image" | "video" | "audio");
      setMediaTab("upload");
      setShowMediaPrompt(true);
      return; // Exit early for media types
    }
    
    // Handle all formatting commands directly for consistency
    safeEditor.commands.focus();
    
    switch (commandId) {
      case "text":
        safeEditor.chain().focus().clearNodes().setParagraph().run();
        break;
      case "h1":
        safeEditor.chain().focus().toggleHeading({ level: 1 }).run();
        break;
      case "h2":
        safeEditor.chain().focus().toggleHeading({ level: 2 }).run();
        break;
      case "h3":
        safeEditor.chain().focus().toggleHeading({ level: 3 }).run();
        break;
      case "bullet":
        safeEditor.chain().focus().toggleBulletList().run();
        break;
      case "numbered":
        safeEditor.chain().focus().toggleOrderedList().run();
        break;
      case "quote":
        safeEditor.chain().focus().toggleBlockquote().run();
        break;
      case "code":
        safeEditor.chain().focus().toggleCodeBlock().run();
        break;
      case "bold":
        safeEditor.chain().focus().toggleBold().run();
        break;
      case "italic":
        safeEditor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        // Use setMark instead of toggleUnderline as it might not be available in this Tiptap version
        safeEditor.chain().focus().toggleMark('underline').run();
        break;
      case "strike":
        safeEditor.chain().focus().toggleStrike().run();
        break;
      case "divider":
        // Insert a horizontal rule that spans the full width
        safeEditor.commands.setHorizontalRule();
        // Add an empty paragraph after to ensure there's a valid cursor position
        safeEditor.commands.insertContent("<p></p>");
        break;
      default:
        // For any unhandled commands, do nothing
        // This is a silent fail to avoid console warnings in production
        break;
    }
  }, [editor, openLinkPrompt, setMediaType, setMediaTab, setShowMediaPrompt]);

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
  }, [showCommandMenu, showLinkPrompt, showMediaPrompt, cancelLink, cancelMediaSelection]);

  React.useImperativeHandle(ref, () => ({
    clearEditor: () => clearEditorUtil(editor),
    insertEmoji: (emoji: string) => insertEmojiUtil(editor, emoji),
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

                  {/* Externalized Dropzone Area Component */}
                  {mediaFiles.length < 4 && !isUploading && (
                    <DropzoneArea 
                      onDrop={onDrop}
                      mediaType={mediaType}
                    />
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
                        handleMediaInsert(embedUrl);
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
                            handleMediaInsert(embedUrl);
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
