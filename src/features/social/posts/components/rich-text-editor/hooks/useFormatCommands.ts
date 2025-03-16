import { useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import type { FormatCommand } from '../types';

/**
 * Hook to handle formatting operations in the rich text editor
 */
export function useFormatCommands({
  editor,
  setShowLinkPrompt,
  setLinkUrl,
  setMediaType,
  setMediaTab,
  setShowMediaPrompt,
}: {
  editor: Editor | null;
  setShowLinkPrompt: (show: boolean) => void;
  setLinkUrl: (url: string) => void;
  setMediaType: (type: "image" | "video" | "audio") => void;
  setMediaTab: (tab: "upload" | "embed") => void;
  setShowMediaPrompt: (show: boolean) => void;
}) {
  const applyFormat = useCallback(
    (command: FormatCommand) => {
      if (!editor) return;

      // Special handling for link, image, video, and audio which have their own UI flows
      if (command.id === "link") {
        setLinkUrl("");
        setShowLinkPrompt(true);
        return; // Exit early for link
      } else if (["image", "video", "audio"].includes(command.id)) {
        setMediaType(command.id as "image" | "video" | "audio");
        setMediaTab("upload");
        setShowMediaPrompt(true);
        return; // Exit early for media types
      }

      // Ensure editor is focused before applying format
      editor.commands.focus();

      // We'll keep this commented for future use if needed
      // const { selection } = editor.state;
      // const node = selection.$head.parent;
      // const isEmpty = node.content.size === 0;
      
      // Check if we're in a list to preserve content below the current position
      const isInList = editor.isActive('bulletList') || editor.isActive('orderedList');

      // Process the command based on its ID
      
      switch (command.id) {
        case "text":
          editor.chain().focus().clearNodes().setParagraph().run();
          break;
        case "h1":
          if (isInList) {
            // If in a list, only apply to current node without clearing all content
            editor.chain()
              .focus()
              .setHeading({ level: 1 })
              .run();
          } else {
            // First clear any existing content
            editor.commands.clearContent();
            // Then create a heading with empty content
            editor.commands.setHeading({ level: 1 });
            // Force cursor to beginning by explicitly setting selection
            editor.commands.focus('start');
          }
          break;
        case "h2":
          if (isInList) {
            // If in a list, only apply to current node without clearing all content
            editor.chain()
              .focus()
              .setHeading({ level: 2 })
              .run();
          } else {
            // First clear any existing content
            editor.commands.clearContent();
            // Then create a heading with empty content
            editor.commands.setHeading({ level: 2 });
            // Force cursor to beginning by explicitly setting selection
            editor.commands.focus('start');
          }
          break;
        case "h3":
          if (isInList) {
            // If in a list, only apply to current node without clearing all content
            editor.chain()
              .focus()
              .setHeading({ level: 3 })
              .run();
          } else {
            // First clear any existing content
            editor.commands.clearContent();
            // Then create a heading with empty content
            editor.commands.setHeading({ level: 3 });
            // Force cursor to beginning by explicitly setting selection
            editor.commands.focus('start');
          }
          break;
        case "bullet":
          if (editor.isActive("bulletList")) {
            // If already in a bullet list, lift the list item
            editor.commands.liftListItem("listItem");
          } else if (isInList) {
            // If in a different type of list, convert only this item to bullet list
            editor.chain()
              .focus()
              .liftListItem("listItem")
              .wrapInList("bulletList")
              .run();
          } else {
            // First clear any existing content
            editor.commands.clearContent();
            // Then create a bullet list with empty content
            editor.commands.wrapInList("bulletList");
            // Force cursor to beginning by explicitly setting selection
            editor.commands.focus('start');
          }
          break;
        case "numbered":
          if (editor.isActive("orderedList")) {
            // If already in a numbered list, lift the list item
            editor.commands.liftListItem("listItem");
          } else if (isInList) {
            // If in a different type of list, convert only this item to numbered list
            editor.chain()
              .focus()
              .liftListItem("listItem")
              .wrapInList("orderedList")
              .run();
          } else {
            // First clear any existing content
            editor.commands.clearContent();
            // Then create a numbered list with empty content
            editor.commands.wrapInList("orderedList");
            // Force cursor to beginning by explicitly setting selection
            editor.commands.focus('start');
          }
          break;
        case "quote":
          // Set blockquote with italic styling
          if (isInList) {
            // If in a list, only apply to current node without clearing all content
            editor.chain()
              .focus()
              .liftListItem("listItem")
              .setBlockquote()
              .setMark("italic")
              .run();
          } else {
            // First clear any existing content
            editor.commands.clearContent();
            // Then create a blockquote with empty content
            editor.commands.setBlockquote();
            editor.commands.setMark("italic");
            // Force cursor to beginning by explicitly setting selection
            editor.commands.focus('start');
          }
          break;
        case "code":
          if (isInList) {
            // If in a list, only apply to current node without clearing all content
            editor.chain()
              .focus()
              .liftListItem("listItem")
              .setCodeBlock()
              .run();
          } else {
            // First clear any existing content
            editor.commands.clearContent();
            // Then create a code block with empty content
            editor.commands.setCodeBlock();
            // Force cursor to beginning by explicitly setting selection
            editor.commands.focus('start');
          }
          break;
        case "divider":
          // Insert a horizontal rule that spans the full width
          editor.commands.setHorizontalRule();
          // Add an empty paragraph after to ensure there's a valid cursor position
          editor.commands.insertContent("<p></p>");
          // Position cursor after the divider
          editor.commands.focus('end');
          break;
      }
    },
    [editor, setLinkUrl, setMediaTab, setMediaType, setShowLinkPrompt, setShowMediaPrompt],
  );

  return { applyFormat };
}