"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useCallback, useEffect, useState } from "react";
import { type FormatCommand } from "./command-menu";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onCommand: (command: string) => void;
  placeholder?: string;
  className?: string;
}

const baseClass = `
  prose prose-sm dark:prose-invert
  focus:outline-none max-w-none w-full
  prose-headings:font-bold 
  prose-h1:text-2xl prose-h1:mt-0
  prose-h2:text-xl prose-h2:mt-0
  prose-h3:text-lg prose-h3:mt-0
  prose-p:my-0
  whitespace-pre-line break-words text-[15px] leading-relaxed text-foreground/90
`;

export function RichTextEditor({
  content,
  onChange,
  onCommand,
  placeholder = "What's on your mind? Type / for formatting...",
  className,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        paragraph: {
          HTMLAttributes: {
            class: 'text-foreground/90',
          },
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: 'before:content-[attr(data-placeholder)] before:text-muted-foreground/50 before:float-left before:pointer-events-none',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onKeyDown: ({ event }) => {
      if (event.key === "/" && !event.shiftKey) {
        onCommand("/");
        event.preventDefault();
      }
    },
  });

  const applyFormat = useCallback((command: FormatCommand, text?: string) => {
    if (!editor) return;

    switch (command.id) {
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
      case "divider":
        editor.chain().focus().setHorizontalRule().run();
        break;
    }
  }, [editor]);

  // Update editor content when prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <EditorContent
      editor={editor}
      className={cn(baseClass, className)}
    />
  );
}

export function useRichTextEditor(initialContent: string = "") {
  const [content, setContent] = useState(initialContent);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [commandText, setCommandText] = useState("");

  const handleCommand = useCallback((cmd: string) => {
    if (cmd === "/") {
      setShowCommandMenu(true);
      setCommandText("");
    }
  }, []);

  const handleCommandSelect = useCallback((command: FormatCommand, text?: string) => {
    setShowCommandMenu(false);
    setCommandText("");
  }, []);

  return {
    content,
    setContent,
    showCommandMenu,
    setShowCommandMenu,
    commandText,
    setCommandText,
    handleCommand,
    handleCommandSelect,
  };
}
