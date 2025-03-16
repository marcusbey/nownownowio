import type { Editor } from "@tiptap/react";

/**
 * Applies a formatting command to the editor
 * @param editor The TipTap editor instance
 * @param commandId The ID of the command to apply
 */
export function applyFormatCommand(
  editor: Editor | null,
  commandId: string
): void {
  if (!editor) return;

  // Ensure editor is focused before applying format
  editor.commands.focus();

  switch (commandId) {
    case "text":
      editor.chain().focus().clearNodes().setParagraph().run();
      break;
    case "h1":
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      break;
    case "h2":
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      break;
    case "h3":
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      break;
    case "bullet":
      editor.chain().focus().toggleBulletList().run();
      break;
    case "numbered":
      editor.chain().focus().toggleOrderedList().run();
      break;
    case "quote":
      editor.chain().focus().toggleBlockquote().run();
      break;
    case "code":
      editor.chain().focus().toggleCodeBlock().run();
      break;
    case "bold":
      editor.chain().focus().toggleBold().run();
      break;
    case "italic":
      editor.chain().focus().toggleItalic().run();
      break;
    case "underline":
      editor.chain().focus().toggleUnderline().run();
      break;
    case "strike":
      editor.chain().focus().toggleStrike().run();
      break;
    case "divider":
      // Insert a horizontal rule that spans the full width
      editor.commands.setHorizontalRule();
      // Add an empty paragraph after to ensure there's a valid cursor position
      editor.commands.insertContent("<p></p>");
      break;
    default:
      break;
  }

  // Move cursor to start if current node is empty or if switching to a new block type
  // Skip this for divider which doesn't need cursor positioning
  // Also skip for link, image, video, and audio which have their own handling
  if (
    !["divider", "link", "image", "video", "audio"].includes(commandId)
  ) {
    const { selection } = editor.state;
    const node = selection.$head.parent;
    const isEmpty = node.content.size === 0;

    if (isEmpty && ["h1", "h2", "h3", "bullet", "numbered", "quote", "code"].includes(commandId)) {
      editor.commands.focus("start");
    }
  }
}

/**
 * Clears the editor content
 * @param editor The TipTap editor instance
 */
export function clearEditor(editor: Editor | null): void {
  if (!editor) return;
  editor.commands.clearContent();
}

/**
 * Inserts an emoji at the current cursor position
 * @param editor The TipTap editor instance
 * @param emoji The emoji to insert
 */
export function insertEmoji(editor: Editor | null, emoji: string): void {
  if (!editor) return;
  editor.commands.focus();
  editor.commands.insertContent(emoji);
}
