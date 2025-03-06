import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/composite/command";
import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import type { Editor } from "@tiptap/react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import React from "react";

type RichTextEditorProps = {
  onChange?: (content: string) => void;
  onEmojiSelect?: (emoji: string) => void;
};

const RichTextEditor = React.forwardRef<
  { clearEditor: () => void },
  RichTextEditorProps
>(({ onChange, onEmojiSelect }, ref) => {
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
    { id: "link", label: "Link", icon: "🔗" },
  ];

  const [showCommandMenu, setShowCommandMenu] = React.useState(false);
  const [showLinkPrompt, setShowLinkPrompt] = React.useState(false);
  const [linkUrl, setLinkUrl] = React.useState("");

  /**
   * Filters commands based on the input search string.
   * Handles multi-word searches by skipping non-matching words and filtering based on matching words.
   */
  const filteredCommands = React.useMemo(() => {
    const searchWords = commandSearch.trim().toLowerCase().split(/\s+/);
    if (searchWords.length === 0 || !commandSearch.trim())
      return formatCommands;

    // Find the first word that matches any command
    let startIndex = -1;
    for (let i = 0; i < searchWords.length; i++) {
      const word = searchWords[i];
      const matches = formatCommands.some((cmd) => {
        const cmdText = `${cmd.id} ${cmd.label}`.toLowerCase();
        return cmdText.includes(word);
      });
      if (matches) {
        startIndex = i;
        break;
      }
    }

    // If no word matches, return empty array
    if (startIndex === -1) return [];

    // Filter commands based on all words from the first matching word
    const relevantWords = searchWords.slice(startIndex);
    return formatCommands.filter((cmd) => {
      const cmdText = `${cmd.id} ${cmd.label}`.toLowerCase();
      return relevantWords.every((word) => cmdText.includes(word));
    });
  }, [commandSearch]);

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
    // Explicitly set immediatelyRender to false to avoid SSR hydration mismatches
    immediatelyRender: false,
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
        placeholder: ({ node }) => {
          if (node.type.name === "paragraph") {
            return 'Press "/" for commands...';
          }
          return "";
        },
        className:
          "text-muted-foreground/30 select-none text-sm font-light italic",
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
                  return "Type heading 1...";
                case 2:
                  return "Type heading 2...";
                case 3:
                  return "Type heading 3...";
                default:
                  return "Heading";
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
              return "Write, type '/' for formatting...";
            default:
              return "Write, type '/' for formatting...";
          }
        },
        showOnlyWhenEditable: true,
        showCursor: true,
      }),
      Link.configure({
        openOnClick: false,
      }),
    ],
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    onFocus: ({ editor }) => {
      // If content is empty, move cursor to start
      if (editor.isEmpty) {
        editor.commands.setTextSelection(0);
      }
    },
    editorProps: {
      attributes: {
        class:
          "prose-base focus:outline-none leading-relaxed [&_p]:text-base [&_blockquote]:italic [&_*]:!text-foreground [&_h1]:text-3xl [&_h2]:text-2xl [&_h3]:text-xl [&_h1,&_h2,&_h3]:font-medium",
      },
      handleKeyDown: (view, event) => {
        // Restore slash-command menu navigation:
        if (showCommandMenu) {
          if (event.key === "ArrowUp") {
            event.preventDefault();
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : filteredCommands.length - 1,
            );
            return true;
          }
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setSelectedIndex((prev) =>
              prev < filteredCommands.length - 1 ? prev + 1 : 0,
            );
            return true;
          }
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            const selectedCommand = filteredCommands[selectedIndex];
            if (selectedCommand) {
              applyFormat(selectedCommand);
            }
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
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            if ($from.parent.textContent.trim() === "") {
              editor?.chain().focus().liftListItem("listItem").run();
            } else {
              editor?.chain().focus().splitListItem("listItem").run();
            }
            return true;
          }
          if (["Backspace", "Escape"].includes(event.key)) {
            if ($from.parent.textContent.trim() === "") {
              event.preventDefault();
              editor?.chain().focus().liftListItem("listItem").run();
              return true;
            }
          }
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

  const applyFormat = (command: { id: string; label: string }) => {
    if (!editor) return;

    // Get the current node
    const node = editor.state.selection.$head.parent;
    const isEmpty = node.content.size === 0;

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
      case "link":
        setLinkUrl("");
        setShowLinkPrompt(true);
        return;
    }

    // Move cursor to start if current node is empty or if switching to a new block type
    if (
      isEmpty ||
      node.type.name !== editor.state.selection.$head.parent.type.name
    ) {
      const pos = editor.state.selection.$head.before();
      editor.commands.setTextSelection(pos);
    }
  };

  const confirmLink = () => {
    if (!editor || !linkUrl.trim()) {
      setShowLinkPrompt(false);
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl.trim() })
      .run();
    setShowLinkPrompt(false);
    setLinkUrl("");
  };

  const cancelLink = () => {
    setShowLinkPrompt(false);
    setLinkUrl("");
  };

  React.useImperativeHandle(ref, () => ({
    clearEditor: () => {
      if (editor) {
        editor.commands.clearContent(true);
      }
    },
    insertEmoji: (emoji: string) => {
      if (editor) {
        editor.commands.insertContent(emoji);
      }
    },
  }));

  return (
    <div className="w-full">
      <div className="relative">
        <div className="relative grow">
          <EditorContent
            editor={editor}
            className={cn(
              "w-full min-h-[150px]",
              "focus-within:outline-none",
              "rounded-lg",
              "prose prose-sm dark:prose-invert max-w-none",
              // Unified text color
              "[--tw-prose-body:var(--foreground)]",
              "[--tw-prose-headings:var(--foreground)]",
              "[--tw-prose-lead:var(--foreground)]",
              "[--tw-prose-links:var(--foreground)]",
              "[--tw-prose-bold:var(--foreground)]",
              "[--tw-prose-counters:var(--foreground)]",
              "[--tw-prose-bullets:var(--foreground)]",
              "[--tw-prose-quotes:var(--foreground)]",
              "[--tw-prose-quote-borders:var(--border)]",
              "[--tw-prose-captions:var(--foreground)]",
              "[--tw-prose-code:var(--foreground)]",
              "[--tw-prose-pre-code:var(--foreground)]",
              "[--tw-prose-pre-bg:var(--background)]",
              "[--tw-prose-th-borders:var(--border)]",
              "[--tw-prose-td-borders:var(--border)]",
              // Compact spacing
              "[&_p]:mt-[0.5em] [&_p]:mb-[0.5em]",
              "[&_h1]:mt-[0.5em] [&_h1]:mb-[0.5em]",
              "[&_h2]:mt-[0.5em] [&_h2]:mb-[0.5em]",
              "[&_h3]:mt-[0.5em] [&_h3]:mb-[0.5em]",
              "[&_ul]:mt-[0.5em] [&_ul]:mb-[0.5em]",
              "[&_ol]:mt-[0.5em] [&_ol]:mb-[0.5em]",
              "[&_blockquote]:mt-[0.5em] [&_blockquote]:mb-[0.5em]",
              "[&_pre]:mt-[0.5em] [&_pre]:mb-[0.5em]",
              // Existing styles
              "[&_*]:!text-foreground [&_*]:!opacity-100", // Optional fallback
              "[&_p]:text-base [&_ul]:text-base [&_ol]:text-base",
              "p-4",
              "bg-zinc-800/70 dark:bg-zinc-800/70",
              "border border-zinc-700/50 dark:border-zinc-700/50",
              "[&_.ProseMirror]:min-h-[120px]",
              "[&_p]:leading-6",
              "[&_h1]:leading-8",
              "[&_h2]:leading-7",
              "[&_h3]:leading-6",
              // Placeholder styles (kept distinct)
              "[&_.ProseMirror_p.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_p.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_p.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_p.is-empty::before]:float-left",
              "[&_.ProseMirror_p.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_p.is-empty::before]:h-0",
              "[&_.ProseMirror_h1.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_h1.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_h1.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_h1.is-empty::before]:float-left",
              "[&_.ProseMirror_h1.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_h2.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_h2.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_h2.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_h2.is-empty::before]:float-left",
              "[&_.ProseMirror_h2.is-empty::before]:pointer-events-none",
              "[&_.ProseMirror_h3.is-empty::before]:content-[attr(data-placeholder)]",
              "[&_.ProseMirror_h3.is-empty::before]:text-gray-500",
              "[&_.ProseMirror_h3.is-empty::before]:dark:text-gray-400",
              "[&_.ProseMirror_h3.is-empty::before]:float-left",
              "[&_.ProseMirror_h3.is-empty::before]:pointer-events-none",
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
              <CommandInput
                value={commandSearch}
                onValueChange={setCommandSearch}
                placeholder="/Filter..."
              />
              <CommandList>
                <CommandEmpty className="p-2 text-sm text-gray-500 dark:text-gray-400">
                  No results found.
                </CommandEmpty>
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
              </CommandList>
            </Command>
          </div>
        )}

        {showLinkPrompt && (
          <div className="absolute left-1/2 top-1/2 z-50 flex w-[220px] -translate-x-1/2 -translate-y-1/2 flex-col gap-2 rounded-md border bg-white p-3 shadow dark:border-gray-700 dark:bg-gray-900">
            <input
              type="url"
              className="w-full rounded border p-1 text-sm dark:border-gray-700 dark:bg-gray-800"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-2 py-1 text-sm text-gray-600 hover:text-red-500"
                onClick={cancelLink}
              >
                Cancel
              </button>
              <button
                className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-500"
                onClick={confirmLink}
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";

export default RichTextEditor;
