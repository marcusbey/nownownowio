import React, { useEffect, useRef } from 'react';
import type { CommandMenuProps } from '../types';

/**
 * Command menu component that displays a list of formatting options
 * when the user types '/' at the beginning of a line
 */
export function CommandMenu({
  editor,
  showCommandMenu,
  setShowCommandMenu,
  menuPosition,
  commandSearch,
  setCommandSearch,
  selectedIndex,
  setSelectedIndex,
  filteredCommands,
  applyFormat,
}: CommandMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle keyboard navigation and selection
  useEffect(() => {
    if (!showCommandMenu) return;

    const handleKeyDown = (e: KeyboardEvent) => {

      // Handle arrow keys for navigation
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev: number) => 
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev: number) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        // Apply the selected command
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          applyFormat(filteredCommands[selectedIndex]);
          setShowCommandMenu(false);
          setCommandSearch('');
        }
      } else if (e.key === 'Escape') {
        // Close the menu
        e.preventDefault();
        setShowCommandMenu(false);
        setCommandSearch('');
        editor?.commands.focus();
      }
    };

    // Close the menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowCommandMenu(false);
        setCommandSearch('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCommandMenu, filteredCommands, selectedIndex, editor, applyFormat, setCommandSearch, setSelectedIndex, setShowCommandMenu]);

  // Scroll selected item into view
  useEffect(() => {
    if (!showCommandMenu || !menuRef.current) return;

    const selectedElement = menuRef.current.querySelector(
      `[data-index="${selectedIndex}"]`
    );

    if (selectedElement) {
      selectedElement.scrollIntoView({
        block: 'nearest',
        inline: 'nearest',
      });
    }
  }, [selectedIndex, showCommandMenu]);

  if (!showCommandMenu) return null;

  return (
    <div
      ref={menuRef}
      className="absolute z-50 max-h-80 w-64 overflow-hidden overflow-y-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800"
      style={{
        top: `${menuPosition.y}px`,
        left: `${menuPosition.x}px`,
      }}
    >
      <div className="border-b border-gray-200 p-2 dark:border-gray-700">
        <input
          type="text"
          value={commandSearch}
          onChange={(e) => setCommandSearch(e.target.value)}
          placeholder="Search commands..."
          className="w-full rounded-md bg-gray-100 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          autoFocus
        />
      </div>

      <div className="py-1">
        {filteredCommands.length > 0 ? (
          filteredCommands.map((command, index) => (
            <button
              key={command.id}
              data-index={index}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left ${
                index === selectedIndex
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={() => {
                applyFormat(command);
                setShowCommandMenu(false);
                setCommandSearch('');
              }}
            >
              <span className="flex size-6 items-center justify-center rounded bg-gray-200 dark:bg-gray-600">
                {command.icon}
              </span>
              <span>{command.label}</span>
            </button>
          ))
        ) : (
          <div className="px-4 py-2 text-gray-500 dark:text-gray-400">
            No commands found
          </div>
        )}
      </div>
    </div>
  );
}