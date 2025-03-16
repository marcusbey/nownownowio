import { useState, useRef, useCallback, RefObject } from 'react';
import type { Editor } from '@tiptap/react';
import type { FormatCommand, MenuPosition } from '../types';
import { updateMenuPosition } from '../utils';

interface UseCommandMenuProps {
  editor: Editor | null;
  onFormatCommand: (command: FormatCommand) => void;
}

interface UseCommandMenuReturn {
  menuRef: RefObject<HTMLDivElement>;
  showCommandMenu: boolean;
  setShowCommandMenu: (show: boolean) => void;
  menuPosition: MenuPosition;
  setMenuPosition: (position: MenuPosition) => void;
  commandSearch: string;
  setCommandSearch: (search: string) => void;
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  filteredCommands: FormatCommand[];
  handleSlashKey: (event: React.KeyboardEvent) => void;
  handleCommandNavigation: (event: React.KeyboardEvent) => void;
  updateCommandMenuPosition: () => void;
}

/**
 * Hook to manage the command menu functionality
 */
export function useCommandMenu({
  editor,
  onFormatCommand,
}: UseCommandMenuProps): UseCommandMenuReturn {
  // Command menu state
  const menuRef = useRef<HTMLDivElement>(null);
  const [showCommandMenu, setShowCommandMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [commandSearch, setCommandSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter commands based on search input
  const filteredCommands = useCallback(
    (commands: FormatCommand[], search: string) => {
      if (!search.trim()) return commands;
      
      return commands.filter((command) =>
        command.title.toLowerCase().includes(search.toLowerCase()) ||
        command.id.toLowerCase().includes(search.toLowerCase())
      );
    },
    []
  );

  // Handle the slash key to open the command menu
  const handleSlashKey = useCallback(
    (event: React.KeyboardEvent) => {
      if (!editor || event.key !== '/') return;
      
      // Prevent the slash from being typed
      event.preventDefault();
      
      // Update the menu position
      const position = updateMenuPosition(editor);
      setMenuPosition(position);
      
      // Show the command menu
      setShowCommandMenu(true);
      setCommandSearch('');
      setSelectedIndex(0);
    },
    [editor]
  );

  // Handle keyboard navigation in the command menu
  const handleCommandNavigation = useCallback(
    (event: React.KeyboardEvent) => {
      if (!showCommandMenu) return;
      
      const commands = filteredCommands([], commandSearch);
      
      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % commands.length);
          break;
        case 'ArrowUp':
          event.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
          break;
        case 'Enter':
          event.preventDefault();
          if (commands[selectedIndex]) {
            onFormatCommand(commands[selectedIndex]);
            setShowCommandMenu(false);
          }
          break;
        case 'Escape':
          event.preventDefault();
          setShowCommandMenu(false);
          break;
        default:
          break;
      }
    },
    [showCommandMenu, commandSearch, selectedIndex, onFormatCommand, filteredCommands]
  );

  // Update the command menu position
  const updateCommandMenuPosition = useCallback(() => {
    if (!editor) return;
    
    const position = updateMenuPosition(editor);
    setMenuPosition(position);
  }, [editor]);

  return {
    menuRef,
    showCommandMenu,
    setShowCommandMenu,
    menuPosition,
    setMenuPosition,
    commandSearch,
    setCommandSearch,
    selectedIndex,
    setSelectedIndex,
    filteredCommands: filteredCommands([], commandSearch),
    handleSlashKey,
    handleCommandNavigation,
    updateCommandMenuPosition,
  };
}
