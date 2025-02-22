import React from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { GripVertical } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/composite/command';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  onChange?: (content: string) => void;
}

function RichTextEditor({ onChange }: RichTextEditorProps) {
  const [menuPosition, setMenuPosition] = React.useState({ x: 0, y: 0 });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const menuRef = React.useRef<HTMLDivElement>(null);
const formatCommands = [
  { id: 'text', label: 'Text', icon: '¶' },
  { id: 'h1', label: 'Heading 1', icon: 'H1' },
  { id: 'h2', label: 'Heading 2', icon: 'H2' },
  { id: 'h3', label: 'Heading 3', icon: 'H3' },
  { id: 'bullet', label: 'Bullet List', icon: '•' },
  { id: 'numbered', label: 'Numbered List', icon: '1.' },
  { id: 'quote', label: 'Quote', icon: '"' },
  { id: 'code', label: 'Code Block', icon: '<>' },
];

  const [showCommandMenu, setShowCommandMenu] = React.useState(false);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCommandMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateMenuPosition = (editor: Editor) => {
    const { view } = editor;
    const { from } = view.state.selection;
    const start = view.coordsAtPos(from);
    const editorBox = view.dom.getBoundingClientRect();
    
    setMenuPosition({
      x: start.left - editorBox.left,
      y: start.top - editorBox.top + 24 // Add offset for menu to appear below cursor
    });
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        },
        paragraph: {
          HTMLAttributes: {
            class: 'is-empty'
          }
        },
        paragraph: {
          HTMLAttributes: {
            class: 'paragraph'
          }
        }
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading' && node.attrs.level === 1) {
            return 'Type your heading...';
          }
          if (node.type.name === 'heading' && node.attrs.level === 2) {
            return 'Type your subheading...';
          }
          if (node.type.name === 'heading' && node.attrs.level === 3) {
            return 'Type your section heading...';
          }
          if (node.type.name === 'blockquote') {
            return 'Enter a quote...';
          }
          if (node.type.name === 'codeBlock') {
            return 'Enter your code...';
          }
          if (node.type.name === 'bulletList' || node.type.name === 'orderedList') {
            return 'Enter a list item...';
          }
          if (node.type.name === 'paragraph') {
            return "Write, type '/' for formatting...";
          }
          return "What's on your mind? Type '/' for formatting...";
        },
        showOnlyWhenEditable: true,
        showCursor: true
      })
    ],
    onUpdate: ({ editor }) => {
      // Remove any newlines within blocks
      const content = editor.getHTML();
      if (content.includes('\n')) {
        editor.commands.setContent(content.replace(/\n/g, ' '));
      }
      // Notify parent component of content change
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose-sm focus:outline-none'
      },
      transformPastedText(text) {
        // Convert newlines to spaces when pasting
        return text.replace(/\n/g, ' ');
      },
      handleKeyDown: (view, event) => {
        if (showCommandMenu) {
          if (event.key === 'ArrowUp') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev > 0 ? prev - 1 : formatCommands.length - 1));
            return true;
          }
          if (event.key === 'ArrowDown') {
            event.preventDefault();
            setSelectedIndex((prev) => (prev < formatCommands.length - 1 ? prev + 1 : 0));
            return true;
          }
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            applyFormat(formatCommands[selectedIndex]);
            setShowCommandMenu(false);
            return true;
          }
          if (event.key === 'Escape') {
            event.preventDefault();
            setShowCommandMenu(false);
            return true;
          }
          // Prevent any other key handling while menu is open
          return true;
        }
            
        // Get current node type
        const { $from } = view.state.selection;
        const node = $from.node();

        // Handle lists
        if (node.type.name === 'listItem') {
          // If the list item is empty, lift it out of the list
          if ($from.parent.textContent.trim() === '') {
            editor?.chain().focus().liftListItem('listItem').run();
            return true;
          }
          
          // Otherwise split the list item
          editor?.chain().focus().splitListItem('listItem').run();
          return true;
        }
        
        // For non-list blocks, create a new block
        if (event.key === 'Enter' && !event.shiftKey) {
          event.preventDefault();

          if (node.type.name === 'paragraph') {
            view.dispatch(view.state.tr.split($from.pos));
          } else {
            view.dispatch(view.state.tr.split($from.pos));
          }
          
          return true;
        }
        
        // Allow continuing in the same block with Shift+Enter
        if (event.key === 'Enter' && event.shiftKey) {
          event.preventDefault();
          editor?.commands.enter();
          return true;
        }

        if (event.key === '/' && !showCommandMenu) {
          event.preventDefault();
          setShowCommandMenu(true);
          setSelectedIndex(0);
          updateMenuPosition(editor);
          return true;
        }
        return false;
      }
    }
  });

  const applyFormat = (command: { id: string }) => {
    if (!editor) return;

    switch (command.id) {
      case 'text':
        editor.chain().focus().clearNodes().setParagraph().run();
        break;
      case 'h1':
        editor.chain().focus().clearNodes().setHeading({ level: 1 }).run();
        break;
      case 'h2':
        editor.chain().focus().clearNodes().setHeading({ level: 2 }).run();
        break;
      case 'h3':
        editor.chain().focus().clearNodes().setHeading({ level: 3 }).run();
        break;
      case 'bullet':
        if (editor.isActive('bulletList')) {
          editor.chain().focus().liftListItem('listItem').run();
        } else {
          editor.chain().focus().toggleBulletList().run();
        }
        break;
      case 'numbered':
        if (editor.isActive('orderedList')) {
          editor.chain().focus().liftListItem('listItem').run();
        } else {
          editor.chain().focus().toggleOrderedList().run();
        }
        break;
      case 'quote':
        editor.chain().focus().clearNodes().setBlockquote().run();
        break;
      case 'code':
        editor.chain().focus().clearNodes().setCodeBlock().run();
        break;
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <div className="flex items-start gap-1">
          <div className="flex-none w-4 h-[1.75rem] flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <GripVertical className="w-3 h-3 text-gray-400 dark:text-gray-500 cursor-move hover:text-gray-600 dark:hover:text-gray-400 flex-shrink-0" />
          </div>
          <div className="flex-grow group">
            <EditorContent
              editor={editor}
              className={cn(
                'w-full min-h-[150px]',
                'focus-within:outline-none',
                'rounded-lg',
                'prose prose-sm dark:prose-invert max-w-none leading-[1.75rem]',
                'p-4',
                'bg-white dark:bg-gray-900',
                'border border-gray-200 dark:border-gray-700',
                '[&_.ProseMirror]:min-h-[120px]',
                '[&_.ProseMirror_p.is-empty::before]:content-[attr(data-placeholder)]',
                '[&_.ProseMirror_p.is-empty::before]:text-gray-500',
                '[&_.ProseMirror_p.is-empty::before]:dark:text-gray-400',
                '[&_.ProseMirror_p.is-empty::before]:float-left',
                '[&_.ProseMirror_p.is-empty::before]:pointer-events-none',
                '[&_.ProseMirror_p.is-empty::before]:h-0',
                '[&_.ProseMirror_p.is-empty]:!text-gray-500',
                '[&_.ProseMirror_p.is-empty]:!dark:text-gray-400'
              )}
            />
          </div>
        </div>
        
        {showCommandMenu && (
          <div 
            className="absolute w-72 z-50"
            ref={menuRef}
            style={{
              left: `${menuPosition.x}px`,
              top: `${menuPosition.y}px`
            }}
          >
            <Command className="rounded-lg border shadow-md bg-white dark:bg-gray-900 dark:border-gray-700">
              <CommandGroup>
                {formatCommands.map((command, index) => (
                  <CommandItem
                    key={command.id}
                    onMouseEnter={() => setSelectedIndex(index)}
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevent editor from losing focus
                      applyFormat(command);
                      setShowCommandMenu(false);
                    }}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 text-sm cursor-pointer text-gray-900 dark:text-gray-100",
                      selectedIndex === index 
                        ? "bg-gray-100 dark:bg-gray-800" 
                        : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    )}
                  >
                    <span className="flex-none w-6 text-center">{command.icon}</span>
                    <span>{command.label}</span>
                    <kbd className="ml-auto text-xs text-gray-500 dark:text-gray-400">{command.id}</kbd>
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandEmpty className="p-2 text-sm text-gray-500 dark:text-gray-400">No results found.</CommandEmpty>
            </Command>
          </div>
        )}
      </div>
    </div>
  );
}

export default RichTextEditor;