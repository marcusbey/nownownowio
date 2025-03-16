import type { Editor } from "@tiptap/react";
import type { EditorView } from "@tiptap/pm/view";

/**
 * Calculates the menu position based on the current cursor position
 * @param editor The TipTap editor instance
 * @returns The calculated menu position
 */
export function updateMenuPosition(
  editor: Editor
): { x: number; y: number } {
  const { view } = editor;
  const { state } = view;
  const { selection } = state;
  const { from } = selection;
  const start = view.coordsAtPos(from);
  const editorBox = view.dom.getBoundingClientRect();

  return {
    x: start.left - editorBox.left,
    y: start.top - editorBox.top + 24, // Add offset for menu to appear below cursor
  };
}

/**
 * Gets the character count from the editor
 * @param editor The TipTap editor instance
 * @returns The character count
 */
export function getCharacterCount(editor: Editor | null): number {
  if (!editor) return 0;
  return editor.storage.characterCount.characters();
}

/**
 * Checks if the editor content is empty
 * @param editor The TipTap editor instance
 * @returns Boolean indicating if the editor is empty
 */
export function isEditorEmpty(editor: Editor | null): boolean {
  if (!editor) return true;
  
  const { state } = editor;
  const { doc } = state;
  
  // Check if there's only one empty paragraph
  if (doc.childCount === 1 && doc.firstChild?.type.name === 'paragraph') {
    return doc.firstChild.content.size === 0;
  }
  
  return false;
}

/**
 * Handles the slash command to show the command menu
 * @param editor The TipTap editor instance
 * @param setShowCommandMenu Function to show/hide the command menu
 * @param updateMenuPosition Function to update the menu position
 * @returns A function to be used in the editor's keydown handler
 */
export function handleSlashCommand(
  editor: Editor,
  setShowCommandMenu: (show: boolean) => void,
  updateMenuPositionFn: () => void
): (view: EditorView, event: KeyboardEvent) => boolean {
  return (view, event) => {
    // Only handle slash key
    if (event.key !== '/') return false;
    
    const { state } = view;
    const { selection } = state;
    const { empty, $from } = selection;
    
    // Only show command menu if cursor is at the start of a line or paragraph
    if (!empty) return false;
    
    const isAtStart = $from.parentOffset === 0;
    
    if (isAtStart) {
      // Prevent the slash from being inserted
      event.preventDefault();
      
      // Show the command menu
      setShowCommandMenu(true);
      
      // Update the menu position
      updateMenuPositionFn();
      
      return true;
    }
    
    return false;
  };
}
