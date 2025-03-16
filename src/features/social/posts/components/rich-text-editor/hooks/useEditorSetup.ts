import { useState, useCallback } from 'react';
import { useEditor } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Link from '@tiptap/extension-link';
import MediaNode from '../extensions/media-node';

interface UseEditorSetupProps {
  onChange?: (content: string) => void;
  maxLength?: number;
  placeholder?: string;
  initialContent?: string;
  autofocus?: boolean;
}

interface UseEditorSetupReturn {
  editor: Editor | null;
  charCount: number;
  setCharCount: (count: number) => void;
}

/**
 * Hook to handle editor initialization and configuration
 */
export function useEditorSetup({
  onChange,
  maxLength = 860,
  placeholder,
  initialContent = '',
  autofocus = false,
}: UseEditorSetupProps): UseEditorSetupReturn {
  const [charCount, setCharCount] = useState(0);

  // Initialize the editor with proper configuration
  const editor = useEditor({
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
          // The doc is always available in editor.state
          // We know node exists since we're in the placeholder function
          const isFirstNode = editor.state.doc.firstChild === node;

          if (isParagraph && isFirstNode) {
            return placeholder ?? 'What do you have in mind? Type "/" for commands...';
          }

          // Get the node type name for switch case
          const nodeTypeName = node.type.name;
          
          // Handle different node types with appropriate placeholder text
          switch (nodeTypeName) {
            case "heading": {
              // We know node.attrs exists since we're in the heading case
              const level = node.attrs.level;
              return `Heading ${level}...`;
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
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose-base focus:outline-none leading-relaxed [&_p]:text-base [&_blockquote]:italic [&_*]:!text-foreground [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h1,&_h2,&_h3]:font-medium",
      },
    },
  });

  return {
    editor,
    charCount,
    setCharCount,
  };
}
