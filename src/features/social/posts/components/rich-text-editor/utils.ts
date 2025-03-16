import type { Editor } from '@tiptap/react';
// FormatCommand is used in applyFormatCommand function
import type { FormatCommand } from './types';

/**
 * Update the position of the command menu based on the current cursor position
 */
export function updateMenuPosition(editor: Editor): { x: number; y: number } {

  const { view } = editor;
  const { state } = view;
  const { selection } = state;
  const { $from } = selection;

  // Get coordinates of the current cursor position
  const coords = view.coordsAtPos($from.pos);
  
  // Calculate position relative to the editor
  const editorRect = view.dom.getBoundingClientRect();
  
  return {
    x: coords.left - editorRect.left,
    y: coords.top - editorRect.top + 24, // Add some offset to position below the cursor
  };
}

// FormatCommand type is used in the existing applyFormatCommand function

/**
 * Clear the editor content
 */
export function clearEditor(editor: Editor | null): void {
  if (!editor) return;
  
  editor.commands.clearContent();
  editor.commands.focus();
}

/**
 * Insert an emoji at the current cursor position
 */
export function insertEmoji(editor: Editor | null, emoji: string): void {
  if (!editor) return;
  
  editor.commands.insertContent(emoji);
  editor.commands.focus();
}

/**
 * Apply a formatting command to the editor
 * @param editor The editor instance
 * @param command The format command object or command ID string
 */
export function applyFormatCommand(editor: Editor | null, command: FormatCommand | string): void {
  if (!editor) return;
  
  // Determine if we're dealing with a FormatCommand object or just a string ID
  const commandId = typeof command === 'string' ? command : command.id;
  
  // Focus the editor first
  editor.commands.focus();
  
  // Apply the appropriate formatting based on the command ID
  switch (commandId) {
    // Headings
    case 'h1':
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      break;
    case 'h2':
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      break;
    case 'h3':
      editor.chain().focus().toggleHeading({ level: 3 }).run();
      break;
    
    // Text formatting
    case 'bold':
      editor.chain().focus().toggleBold().run();
      break;
    case 'italic':
      editor.chain().focus().toggleItalic().run();
      break;
    case 'underline':
      // Note: toggleUnderline is not available in the default StarterKit
      // If you need underline, you need to add the Underline extension
      editor.chain().focus().toggleMark('underline').run();
      break;
    case 'strike':
      editor.chain().focus().toggleStrike().run();
      break;
    
    // Code blocks
    case 'code':
      editor.chain().focus().toggleCodeBlock().run();
      break;
    
    // Lists
    case 'bullet':
    case 'bulletList':
      editor.chain().focus().toggleBulletList().run();
      break;
    case 'numbered':
    case 'orderedList':
      editor.chain().focus().toggleOrderedList().run();
      break;
    
    // Other block elements
    case 'quote':
    case 'blockquote':
      editor.chain().focus().toggleBlockquote().run();
      break;
    case 'divider':
    case 'horizontalRule':
      editor.chain().focus().setHorizontalRule().run();
      break;
    
    // Line breaks
    case 'hardBreak':
      editor.chain().focus().setHardBreak().run();
      break;
    
    // Link handling
    case 'link': {
      const url = window.prompt('URL');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      } else {
        editor.chain().focus().unsetLink().run();
      }
      break;
    }
      
    // Media elements - these typically require custom extensions
    case 'image': {
      const imageUrl = window.prompt('Image URL');
      if (imageUrl) {
        // Use insertContent instead of setImage as it might not be available
        editor.chain().focus()
          .insertContent({
            type: 'image',
            attrs: { src: imageUrl, alt: 'Image' }
          })
          .run();
      }
      break;
    }
      
    case 'video': {
      const videoUrl = window.prompt('Video URL');
      if (videoUrl) {
        // This requires a custom video extension
        // For now, we'll insert it as an HTML node if the editor supports it
        try {
          editor.chain().focus()
            .insertContent(`<video src="${videoUrl}" controls></video>`)
            .run();
        } catch (error) {
          // Use a safer logging approach
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error('Video insertion failed:', error);
          }
        }
      }
      break;
    }
      
    case 'audio': {
      const audioUrl = window.prompt('Audio URL');
      if (audioUrl) {
        // This requires a custom audio extension
        // For now, we'll insert it as an HTML node if the editor supports it
        try {
          editor.chain().focus()
            .insertContent(`<audio src="${audioUrl}" controls></audio>`)
            .run();
        } catch (error) {
          // Use a safer logging approach
          if (process.env.NODE_ENV !== 'production') {
            // eslint-disable-next-line no-console
            console.error('Audio insertion failed:', error);
          }
        }
      }
      break;
    }
    case 'clearFormatting':
      editor.chain().focus().clearNodes().unsetAllMarks().run();
      break;
    default:
      // Log warning but avoid console in production
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.warn(`Unknown command: ${commandId}`);
      }
  }
}

/**
 * Handle media insertion from URL
 */
export function handleMediaInsert(
  editor: Editor | null, 
  url: string, 
  mediaType: 'image' | 'video' | 'audio'
): void {
  if (!editor || !url) return;
  
  try {
    // Insert the media node with the appropriate type
    // Note: this assumes you have a custom extension with a setMedia command
    // If using a different approach, adjust this code accordingly
    editor.commands.focus();
    editor.commands.insertContent({
      type: 'mediaNode',
      attrs: { src: url, type: mediaType }
    });
  } catch (error) {
    // Log error but avoid console in production
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('Error inserting media:', error);
    }
    throw error;
  }
}
