import { useToast } from "@/components/feedback/use-toast";
import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import MediaNode from "../extensions/media-node";
import { ACCEPTED_FILE_TYPES, EDITOR_PLACEHOLDER, MAX_MEDIA_FILES } from "./constants";
import { CommandMenu } from "./components/CommandMenu";
import { FormattingToolbar } from "./components/FormattingToolbar";
import { LinkPrompt } from "./components/LinkPrompt";
import { MediaPrompt } from "./components/MediaPrompt";
import { useCommandSearch } from "./hooks/useCommandSearch";
import { useFormatCommands } from "./hooks/useFormatCommands";
import { useLinkInsertion } from "./hooks/useLinkInsertion";
import { useMediaUpload } from "./hooks/useMediaUpload";
import { applyFormatCommand, clearEditor, insertEmoji, updateMenuPosition } from "./utils";
import type { FormatCommand, MenuPosition, RichTextEditorProps } from "./types";

const RichTextEditor = React.forwardRef<
  { clearEditor: () => void; insertEmoji: (emoji: string) => void },
  RichTextEditorProps
>(({ onChange, onMediaSelect, maxLength = 860, placeholder, initialContent = "", autofocus = false }, ref) => {
  const [charCount, setCharCount] = useState(0);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // The toast is used in the useMediaUpload hook
  const { toast: _ } = useToast();

  // Initialize the editor
  const editor = useEditor({
    // Explicitly set immediatelyRender to false to avoid SSR hydration mismatches
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

          // Check if this is a paragraph and if it's the first node
          const isParagraph = typeName === "paragraph";
          const doc = editor.state.doc;
          const isFirstNode = doc.firstChild === node;

          if (isParagraph && isFirstNode) {
            return placeholder ?? EDITOR_PLACEHOLDER;
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
      // Update menu position when selection changes
      const position = updateMenuPosition(editor);
      // Set the menu position with the calculated position
      setMenuPosition(position);
    },
    editorProps: {
      attributes: {
        class:
          "prose-base focus:outline-none leading-relaxed [&_p]:text-base [&_blockquote]:italic [&_*]:!text-foreground [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h1,&_h2,&_h3]:font-medium",
      },
      handleKeyDown: (view, event) => {
        // Handle slash commands
        if (event.key === "/" && !showCommandMenu) {
          const { state } = view;
          const { selection } = state;
          const { empty, $from } = selection;

          // Only show command menu if cursor is at beginning of an empty line or if the line is completely empty
          if (empty) {
            const isAtStart = $from.parentOffset === 0;
            const isEmptyNode = $from.parent.content.size === 0;

            if (isAtStart || isEmptyNode) {
              // Update menu position
              if (editor) {
                handleUpdateMenuPosition(editor);
                setShowCommandMenu(true);
              }
              return true; // Prevent default slash insertion
            }
          }
        }

        // Handle escape key to close menus
        if (event.key === "Escape") {
          if (showCommandMenu) {
            setShowCommandMenu(false);
            return true;
          }
        }

        return false;
      },
    },
  });

  // Update menu position when showing command menu
  const handleUpdateMenuPosition = useCallback((editorInstance: Editor) => {
    const position = updateMenuPosition(editorInstance);
    setMenuPosition(position);
  }, []);

  // Handle media upload
  const {
    mediaFiles,
    mediaType,
    mediaTab,
    isUploading,
    embedUrl,
    showMediaPrompt,
    setShowMediaPrompt,
    setMediaType,
    setMediaTab,
    setEmbedUrl,
    onDrop,
    removeMedia,
    insertMediaToEditor: _insertMediaToEditor,
    confirmMediaSelection,
    cancelMediaSelection,
  } = useMediaUpload({ 
    editor: editor ?? null,
    onMediaSelect
  });

  // Handle link insertion
  const { 
    showLinkPrompt, 
    initialUrl: linkUrl,
    setLinkUrl,
    openLinkPrompt,
    closeLinkPrompt, 
    confirmLink 
  } = useLinkInsertion({ editor: editor as Editor });

  // Get format commands with proper parameters
  const { applyFormat: formatCommand, getCommands } = useFormatCommands({
    editor,
    setShowLinkPrompt: openLinkPrompt,
    setLinkUrl,
    setMediaType,
    setMediaTab,
    setShowMediaPrompt
  });
  
  // Handle command search
  const { 
    filteredCommands, 
    commandSearch, 
    setCommandSearch: setCommandSearchState, 
    selectedIndex, 
    setSelectedIndex: setSelectedIndexState 
  } = useCommandSearch({ formatCommands: getCommands() });
  
  // Create wrapper functions to handle state updates
  const setCommandSearch = useCallback((value: React.SetStateAction<string>) => {
    setCommandSearchState(value);
  }, [setCommandSearchState]);
  
  const setSelectedIndex = useCallback((value: React.SetStateAction<number>) => {
    setSelectedIndexState(value);
  }, [setSelectedIndexState]);
  
  // Handle media insertion from URL - using the insertMediaToEditor function from useMediaUpload
  const handleMediaInsert = useCallback((url: string) => {
    if (!url || !editor) return;
    
    try {
      // Use the insertMediaToEditor function from useMediaUpload
      _insertMediaToEditor(url, mediaType);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      window.console.warn("Error inserting media:", errorMessage);
    }
  }, [_insertMediaToEditor, mediaType, editor]);

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: MAX_MEDIA_FILES,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: mediaFiles.length >= MAX_MEDIA_FILES || isUploading,
  });

  // Apply format command - moved up to avoid being used before declaration
  const applyFormat = useCallback(
    (command: FormatCommand) => {
      if (!editor) return;

      // Remove the slash if it exists at the beginning
      if (editor.state.selection.$from.parentOffset === 1) {
        const text = editor.state.selection.$from.parent.textContent;
        if (text.startsWith("/")) {
          editor.commands.deleteRange({
            from: editor.state.selection.from - 1,
            to: editor.state.selection.from,
          });
        }
      }

      // Special handling for link, image, video, and audio which have their own UI flows
      if (command.id === "link") {
        openLinkPrompt();
        return;
      } else if (command.id === "image" || command.id === "video" || command.id === "audio") {
        setMediaType(command.id as "image" | "video" | "audio");
        setShowMediaPrompt(true);
        return;
      }

      // Apply the format using the utility function
      if (editor) {
        applyFormatCommand(editor, command.id);
      }
    },
    [editor, openLinkPrompt, setShowMediaPrompt, setMediaType]
  );




  // Handle click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showCommandMenu &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowCommandMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCommandMenu]);

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showCommandMenu) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          setSelectedIndex(Math.min(selectedIndex + 1, filteredCommands.length - 1));
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          setSelectedIndex(Math.max(selectedIndex - 1, 0));
        } else if (event.key === "Enter" && filteredCommands.length > 0) {
          event.preventDefault();
          const selectedCommand = filteredCommands[selectedIndex];
          applyFormat(selectedCommand);
          setShowCommandMenu(false);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showCommandMenu, filteredCommands, selectedIndex, setSelectedIndex, applyFormat]);

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    clearEditor: () => {
      if (editor) clearEditor(editor);
    },
    insertEmoji: (emoji: string) => {
      if (editor) insertEmoji(editor, emoji);
    },
  }), [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="relative">
        {/* Character counter */}
        <div
          className={cn(
            "text-xs text-right mb-1",
            charCount > maxLength
              ? "text-destructive font-medium"
              : "text-muted-foreground"
          )}
        >
          {charCount}/{maxLength}
        </div>

        {/* Formatting toolbar */}
        <div className="mb-2">
          <FormattingToolbar
            editor={editor}
            onLinkClick={openLinkPrompt}
            onImageClick={() => {
              setMediaType("image");
              setShowMediaPrompt(true);
            }}
            onVideoClick={() => {
              setMediaType("video");
              setShowMediaPrompt(true);
            }}
          />
        </div>

        {/* Editor content */}
        <EditorContent
          editor={editor}
          className={cn(
            "min-h-[150px] max-h-[500px] overflow-y-auto rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            charCount > maxLength && "border-destructive"
          )}
        />

        {/* Command menu */}
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
            <CommandMenu
              editor={editor}
              showCommandMenu={showCommandMenu}
              setShowCommandMenu={setShowCommandMenu}
              menuPosition={menuPosition}
              commandSearch={commandSearch}
              setCommandSearch={setCommandSearch}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              filteredCommands={filteredCommands}
              applyFormat={(command) => {
                formatCommand(command);
                setShowCommandMenu(false);
              }}
            />
          </div>
        )}

        {/* Link prompt */}
        {showLinkPrompt && (
          <LinkPrompt
            initialUrl={linkUrl}
            confirmLink={confirmLink}
            cancelLink={closeLinkPrompt}
          />
        )}

        {/* Media prompt */}
        {showMediaPrompt && (
          <MediaPrompt
            mediaFiles={mediaFiles}
            mediaType={mediaType}
            mediaTab={mediaTab}
            isUploading={isUploading}
            embedUrl={embedUrl}
            setMediaType={setMediaType}
            setMediaTab={setMediaTab}
            setEmbedUrl={setEmbedUrl}
            setShowMediaPrompt={setShowMediaPrompt}
            onDrop={onDrop}
            removeMedia={removeMedia}
            confirmMediaSelection={confirmMediaSelection}
            cancelMediaSelection={cancelMediaSelection}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            handleMediaInsert={handleMediaInsert}
          />
        )}
      </div>
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor };
export default RichTextEditor;