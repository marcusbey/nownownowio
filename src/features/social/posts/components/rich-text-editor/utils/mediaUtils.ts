import type { Editor } from "@tiptap/react";
import { TextSelection } from "@tiptap/pm/state";

/**
 * Inserts media content into the editor
 * @param editor The TipTap editor instance
 * @param src The source URL of the media
 * @param type The type of media (image, video, audio)
 * @returns Boolean indicating success
 */
export function insertMediaToEditor(
  editor: Editor | null,
  src: string,
  type: "image" | "video" | "audio"
): boolean {
  if (!editor?.isEditable) return false;

  try {
    // Focus the editor to ensure we have a valid cursor position
    editor.commands.focus();

    // Get the current selection
    const { state } = editor;
    const { selection } = state;
    const { empty } = selection;

    // Insert the media node at the current selection
    if (empty) {
      // If selection is empty (just a cursor), insert at that position
      editor
        .chain()
        .focus()
        .insertContent({
          type: "mediaNode",
          attrs: {
            src,
            type,
            alt: `${type} content`,
          },
        })
        .run();
    } else {
      // If there's a selection, replace it with the media
      editor
        .chain()
        .focus()
        .deleteSelection()
        .insertContent({
          type: "mediaNode",
          attrs: {
            src,
            type,
            alt: `${type} content`,
          },
        })
        .run();
    }

    // Insert a paragraph after the media to ensure the user can continue typing
    editor.commands.insertContent("<p></p>");
    
    return true;
  } catch (error) {
    console.error("Error inserting media:", error);
    
    // Fallback: try to append to the end if insertion at cursor fails
    try {
      editor
        .chain()
        .focus()
        .command(({ tr, dispatch }) => {
          if (dispatch) {
            // Move to the end of the document
            const end = tr.doc.content.size;
            // Create a proper TextSelection
            tr.setSelection(TextSelection.create(tr.doc, end));
            
            // Insert content at the end
            tr.replaceSelectionWith(
              editor.schema.nodes.mediaNode.create({
                src,
                type,
                alt: `${type} content`,
              })
            );
            
            // Add a paragraph after
            const paragraph = editor.schema.nodes.paragraph.create();
            tr.insert(tr.doc.content.size, paragraph);
          }
          return true;
        })
        .run();
      
      return true;
    } catch (fallbackError) {
      console.error("Fallback insertion also failed:", fallbackError);
      return false;
    }
  }
}

/**
 * Creates a preview URL for a file
 * @param file The file to create a preview for
 * @returns The preview URL
 */
export function createFilePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Revokes a file preview URL to free memory
 * @param previewUrl The preview URL to revoke
 */
export function revokeFilePreview(previewUrl: string): void {
  URL.revokeObjectURL(previewUrl);
}
