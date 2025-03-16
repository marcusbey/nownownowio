import { Editor } from '@tiptap/react';
import { useCallback, useEffect } from 'react';
import { FormatCommand } from '../types';
import { updateMenuPosition } from '../utils';

interface UseKeyboardHandlingProps {
  editor: Editor | null;
  showCommandMenu: boolean;
  setShowCommandMenu: (show: boolean) => void;
  showLinkPrompt: boolean;
  cancelLink: () => void;
  showMediaPrompt: boolean;
  cancelMediaSelection: () => void;
  filteredCommands: FormatCommand[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  applyFormat: (command: FormatCommand) => void;
  setMenuPosition: (position: { x: number; y: number }) => void;
}

export function useKeyboardHandling({
  editor,
  showCommandMenu,
  setShowCommandMenu,
  showLinkPrompt,
  cancelLink,
  showMediaPrompt,
  cancelMediaSelection,
  filteredCommands,
  selectedIndex,
  setSelectedIndex,
  applyFormat,
  setMenuPosition,
}: UseKeyboardHandlingProps) {
  // Handle keyboard events for command menu navigation
  const handleCommandMenuKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (showCommandMenu) {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          setSelectedIndex(Math.min(selectedIndex + 1, filteredCommands.length - 1));
        } else if (event.key === 'ArrowUp') {
          event.preventDefault();
          setSelectedIndex(Math.max(selectedIndex - 1, 0));
        } else if (event.key === 'Enter' && filteredCommands.length > 0) {
          event.preventDefault();
          const selectedCommand = filteredCommands[selectedIndex];
          applyFormat(selectedCommand);
          setShowCommandMenu(false);
        } else if (event.key === 'Escape') {
          event.preventDefault();
          setShowCommandMenu(false);
        }
      }
    },
    [showCommandMenu, filteredCommands, selectedIndex, setSelectedIndex, applyFormat, setShowCommandMenu]
  );

  // Handle global escape key for closing all popups
  const handleGlobalEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Close any open popups
        if (showCommandMenu) {
          setShowCommandMenu(false);
        }
        if (showLinkPrompt) {
          cancelLink();
        }
        if (showMediaPrompt) {
          cancelMediaSelection();
        }
      }
    },
    [showCommandMenu, showLinkPrompt, showMediaPrompt, setShowCommandMenu, cancelLink, cancelMediaSelection]
  );

  // Handle slash command activation
  const handleSlashCommand = useCallback(
    (view: any, event: KeyboardEvent) => {
      if (event.key === '/' && !showCommandMenu && editor) {
        // Only trigger slash command if:
        // 1. Cursor is at the beginning of a line, or
        // 2. The current line is empty
        const { $from } = view.state.selection;
        const isAtLineStart = $from.parentOffset === 0;
        const isLineEmpty = $from.parent.textContent.trim() === '';
        
        if (isAtLineStart || isLineEmpty) {
          event.preventDefault();
          setShowCommandMenu(true);
          setSelectedIndex(0);
          
          // Update menu position
          const position = updateMenuPosition(editor);
          setMenuPosition(position);
          return true;
        }
      }
      return false;
    },
    [editor, showCommandMenu, setShowCommandMenu, setSelectedIndex, setMenuPosition]
  );

  // Attach global keyboard event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleCommandMenuKeyDown);
    document.addEventListener('keydown', handleGlobalEscape);
    
    return () => {
      document.removeEventListener('keydown', handleCommandMenuKeyDown);
      document.removeEventListener('keydown', handleGlobalEscape);
    };
  }, [handleCommandMenuKeyDown, handleGlobalEscape]);

  return {
    handleSlashCommand,
  };
}
