import { useImperativeHandle, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import { clearEditor as clearEditorUtil, insertEmoji as insertEmojiUtil } from '../utils';

interface UseEditorRefProps {
  editor: Editor | null;
  ref: React.ForwardedRef<{
    clearEditor: () => void;
    insertEmoji: (emoji: string) => void;
  }>;
}

/**
 * Hook to handle editor reference and expose methods for the forwardRef functionality
 */
export function useEditorRef({ editor, ref }: UseEditorRefProps): void {
  // Clear the editor content
  const clearEditor = useCallback(() => {
    if (!editor) return;
    clearEditorUtil(editor);
  }, [editor]);

  // Insert an emoji at the current cursor position
  const insertEmoji = useCallback(
    (emoji: string) => {
      if (!editor) return;
      insertEmojiUtil(editor, emoji);
    },
    [editor]
  );

  // Expose methods to the parent component via ref
  useImperativeHandle(
    ref,
    () => ({
      clearEditor,
      insertEmoji,
    }),
    [clearEditor, insertEmoji]
  );
}
