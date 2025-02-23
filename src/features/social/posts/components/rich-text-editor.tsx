import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/composite/command";
import { cn } from "@/lib/utils";
import Placeholder from "@tiptap/extension-placeholder";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { GripVertical } from "lucide-react";
import React from "react";
import { Hashtag } from "./extensions/Hashtag";

type RichTextEditorProps = {
  onChange?: (content: string) => void;
};

const RichTextEditor = React.forwardRef<{ clearEditor: () => void }, RichTextEditorProps>(({ onChange }, ref) => {
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [commandSearch, setCommandSearch] = React.useState("");
  const menuRef = React.useRef<HTMLDivElement>(null);
  const formatCommands = [
    { id: "text", label: "Text", icon: "¶" },
    { id: "h1", label: "Heading 1", icon: "H1" },
    { id: "h2", label: "Heading 2", icon: "H2" },
    { id: "h3", label: "Heading 3", icon: "H3" },
    { id: "bullet", label: "Bullet List", icon: "•" },
    { id: "numbered", label: "Numbered List", icon: "1." },
    { id: "quote", label: "Quote", icon: '"' },
    { id: "code", label: "Code Block", icon: "<>" },
  ];

  const [showCommandMenu, setShowCommandMenu] = React.useState(false);

  const filteredCommands = formatCommands.filter(
    (cmd) =>
      cmd.label.toLowerCase().includes(commandSearch.toLowerCase()) ||
      cmd.id.toLowerCase().includes(commandSearch.toLowerCase()),
  );

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCommandMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateMenuPosition = (editor: Editor) => {
    const { view } = editor;
    const { from } = view.state.selection;
    const start = view.coordsAtPos(from);
    const editorBox = view.dom.getBoundingClientRect();

    setMenuPosition({
      x: start.left - editorBox.left,
      y: start.top - editorBox.top + 24, // Add offset for menu to appear below cursor
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        paragraph: {
          HTMLAttributes: {
            class: "is-empty",
          },
        },
      }),
      Placeholder.configure({
        placeholder: ({ node, editor }) => {
          const doc = editor.state.doc;
          const isFirstChild = doc.firstChild && doc.firstChild.eq(node);

          if (isFirstChild && node.type.name === "paragraph") {
            return "What's on your mind? Type '/' for formatting...";
          }

          switch (node.type.name) {
            case "heading":
              switch (node.attrs.level) {
                case 1:
                  return "Heading 1";
                case 2:
                  return "Heading 2";
                case 3:
                  return "Heading 3";
                default:
                  return "Heading";
              }
            case "bulletList":
              return "• List item";
            case "orderedList":
              return "1. List item";
            case "blockquote":
              return "Quote";
            case "codeBlock":
              return "Code";
            case "paragraph":
              return "Write, type '/' for formatting...";
            default:
              return "Write, type '/' for formatting...";
          }
        },
        showOnlyWhenEditable: true,
        showCursor: true,
      }),
      Hashtag,
    ],
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      if (content.includes("\n")) {
        editor.commands.setContent(content.replace(/\n/g, " "));
      }
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose-sm focus:outline-none",
      },
      transformPastedText(text) {
        return text.replace(/\n/g, " ");
      },
      handleKeyDown: (view, event) => {
        if (showCommandMenu) {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : formatCommands.length - 1,
            );
            return true;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((prev) =>
              prev < formatCommands.length - 1 ? prev + 1 : 0,
            );
            return true;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            applyFormat(filteredCommands[selectedIndex]);
            setShowCommandMenu(false);
            return true;
          }
          if (event.key === "Escape") {
            event.preventDefault();
            setShowCommandMenu(false);
            return true;
          }
          if (event.key === "Backspace") {
            event.preventDefault();
            setCommandSearch((prev) => prev.slice(0, -1));
            return true;
          }
          if (/^[a-zA-Z0-9]$/.test(event.key)) {
            event.preventDefault();
            setCommandSearch((prev) => prev + event.key);
            return true;
          }
          return true;
        }

        const { $from } = view.state.selection;
        const node = $from.node();

        if (node.type.name === "listItem") {
          if ($from.parent.textContent.trim() === "") {
            editor?.chain().focus().liftListItem("listItem").run();
            return true;
          }
          editor?.chain().focus().splitListItem("listItem").run();
          return true;
        }

        if (event.key === "Enter" && !event.shiftKey && !showCommandMenu) {
          event.preventDefault();

          if (!editor) return false;

          if (editor.can().splitBlock()) {
            editor.chain().focus().splitBlock().run();
            return true;
          }

          if (node.type.name !== "paragraph" && editor.can().setParagraph()) {
            editor.chain().focus().setParagraph().run();
          } else if (editor.can().splitBlock()) {
            editor.chain().focus().splitBlock().run();
          }

          return true;
        }

        if (event.key === "Enter" && event.shiftKey) {
          event.preventDefault();
          editor?.commands.enter();
          return true;
        }

        if (event.key === "/" && !showCommandMenu) {
          event.preventDefault();
          setShowCommandMenu(true);
          setSelectedIndex(0);
          setCommandSearch("");
          updateMenuPosition(editor);
          return true;
        }
        return false;
      },
    },
  });

  const applyFormat = (command: { id: string }) => {
    if (!editor) return;

    switch (command.id) {
      case "text":
        editor.chain().focus().clearNodes().setParagraph().run();
        break;
      case "h1":
        editor.chain().focus().clearNodes().setHeading({ level: 1 }).run();
        break;
      case "h2":
        editor.chain().focus().clearNodes().setHeading({ level: 2 }).run();
        break;
      case "h3":
        editor.chain().focus().clearNodes().setHeading({ level: 3 }).run();
        break;
      case "bullet":
        if (editor.isActive("bulletList")) {
          editor.chain().focus().liftListItem("listItem").run();
        } else {
          editor.chain().focus().clearNodes().wrapInList("bulletList").run();
        }
        break;
      case "numbered":
        if (editor.isActive("orderedList")) {
          editor.chain().focus().liftListItem("listItem").run();
        } else {
          editor.chain().focus().clearNodes().wrapInList("orderedList").run();
        }
        break;
      case "quote":
        editor.chain().focus().clearNodes().setBlockquote().run();
        break;
      case "code":
        editor.chain().focus().clearNodes().setCodeBlock().run();
        break;
    }
  };

  React.useImperativeHandle(ref, () => ({
    clearEditor: () => {
      if (editor) {
        editor.commands.clearContent(true);
      }
    }
  }));

  return (
    <div className="w-full">
      <div className="relative">
        <div className="group relative grow">
          <div className="absolute left-0 top-3 flex size-4 items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <GripVertical className="size-3 cursor-move text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400" />
          </div>
          <EditorContent
            editor={editor}
            className={cn(
              "w-full min-h-[150px]",
              "focus-within:outline-none",
              "rounded-lg",
              "prose prose-sm dark:prose-invert max-w-none",
              "p-4",
              "bg-white dark:bg-gray-900",
              "border border-gray-200 dark:border-gray-700",
              "[&_.ProseMirror]:min-h-[120px]",
              "[&_p]:leading-3",
              "[&_h1]:leading-7",
              "[&_h2]:leading-6",
              "[&_h3]:leading-5",
              "[&_.ProseMirror_p.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_p.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_p.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_p.is-empty::before]:float-left",
              "[&_.ProseMirror_p.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_p.is-empty::before]:h-0",
              "[&_.ProseMirror_p.is-empty]:!text-gray-500",
              "[&_.ProseMirror_p.is-empty]:!dark:text-gray-400",
              "[&_.ProseMirror_h1.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_h1.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_h1.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_h1.is-empty::before]:float-left",
              "[&_.ProseMirror_h1.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_h1.is-empty]:!text-gray-500",
              "[&_.ProseMirror_h1.is-empty]:!dark:text-gray-400",
              "[&_.ProseMirror_h2.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_h2.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_h2.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_h2.is-empty::before]:float-left",
              "[&_.ProseMirror_h2.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_h2.is-empty]:!text-gray-500",
              "[&_.ProseMirror_h2.is-empty]:!dark:text-gray-400",
              "[&_.ProseMirror_h3.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_h3.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_h3.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_h3.is-empty::before]:float-left",
              "[&_.ProseMirror_h3.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_h3.is-empty]:!text-gray-500",
              "[&_.ProseMirror_h3.is-empty]:!dark:text-gray-400",
            )}
          />
        </div>

        {showCommandMenu && (
          <div
            className="absolute z-50 w-72"
            ref={menuRef}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`,
            }}
          >
            <Command className="rounded-lg border bg-white shadow-md dark:border-gray-700 dark:bg-gray-900">
              <CommandGroup>
                {filteredCommands.map((command, index) => (
                  <CommandItem
                    key={command.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      applyFormat(command);
                      setShowCommandMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer text-gray-900 dark:text-gray-100",
                      selectedIndex === index
                        ? "bg-gray-100 dark:bg-gray-800"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                    )}
                  >
                    <span className="w-6 flex-none text-center">
                      {command.icon}
                    </span>
                    <span>{command.label}</span>
                    <kbd className="ml-auto text-xs text-gray-500 dark:text-gray-400">
                      {command.id}
                    </kbd>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandEmpty className="p-2 text-sm text-gray-500 dark:text-gray-400">
                No results found.
              </CommandEmpty>
            </Command>
          </div>
        )}
      </div>

    </div>
  );
}
export default RichTextEditor;
