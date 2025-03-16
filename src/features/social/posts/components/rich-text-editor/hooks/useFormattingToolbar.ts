import { Editor } from '@tiptap/react';
import { useMemo } from 'react';
import { FORMAT_COMMANDS } from '../constants';
import type { FormatCommand } from '../types';

type UseFormattingToolbarProps = {
  editor: Editor | null;
};

type ToolbarItem = {
  id: string;
  label: string;
  icon: string;
  isActive: boolean;
  onClick: () => void;
};

export function useFormattingToolbar({ editor }: UseFormattingToolbarProps) {
  const toolbarItems = useMemo(() => {
    if (!editor) {
      return [];
    }

    return FORMAT_COMMANDS.map((command: FormatCommand): ToolbarItem => {
      let isActive = false;

      // Check if the command is active based on its type
      switch (command.id) {
        case 'bold':
          isActive = editor.isActive('bold');
          break;
        case 'italic':
          isActive = editor.isActive('italic');
          break;
        case 'underline':
          isActive = editor.isActive('underline');
          break;
        case 'strike':
          isActive = editor.isActive('strike');
          break;
        case 'code':
          isActive = editor.isActive('code');
          break;
        case 'h1':
          isActive = editor.isActive('heading', { level: 1 });
          break;
        case 'h2':
          isActive = editor.isActive('heading', { level: 2 });
          break;
        case 'h3':
          isActive = editor.isActive('heading', { level: 3 });
          break;
        case 'bullet':
          isActive = editor.isActive('bulletList');
          break;
        case 'number':
          isActive = editor.isActive('orderedList');
          break;
        case 'blockquote':
          isActive = editor.isActive('blockquote');
          break;
        case 'link':
          isActive = editor.isActive('link');
          break;
        default:
          isActive = false;
      }

      const onClick = () => {
        if (command.id === 'link') {
          // Link handling is done separately via useLinkInsertion hook
          return;
        }
        
        // Apply the command
        switch (command.id) {
          case 'bold':
            editor.chain().focus().toggleBold().run();
            break;
          case 'italic':
            editor.chain().focus().toggleItalic().run();
            break;
          case 'underline':
            // Underline is not included in the default StarterKit
            // If you need underline, you'll need to add the extension
            editor.chain().focus().toggleMark('underline').run();
            break;
          case 'strike':
            editor.chain().focus().toggleStrike().run();
            break;
          case 'code':
            editor.chain().focus().toggleCode().run();
            break;
          case 'h1':
            editor.chain().focus().toggleHeading({ level: 1 }).run();
            break;
          case 'h2':
            editor.chain().focus().toggleHeading({ level: 2 }).run();
            break;
          case 'h3':
            editor.chain().focus().toggleHeading({ level: 3 }).run();
            break;
          case 'bullet':
            editor.chain().focus().toggleBulletList().run();
            break;
          case 'number':
            editor.chain().focus().toggleOrderedList().run();
            break;
          case 'blockquote':
            editor.chain().focus().toggleBlockquote().run();
            break;
          default:
            break;
        }
      };

      return {
        ...command,
        isActive,
        onClick,
      };
    });
  }, [editor]);

  return {
    toolbarItems,
  };
}
