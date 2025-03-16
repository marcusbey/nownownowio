import { useMemo, useState, type SetStateAction, type Dispatch } from 'react';
import type { FormatCommand } from '../types';

type UseCommandSearchProps = {
  formatCommands: FormatCommand[];
};

type UseCommandSearchReturn = {
  filteredCommands: FormatCommand[];
  commandSearch: string;
  setCommandSearch: Dispatch<SetStateAction<string>>;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
};

/**
 * Hook to filter commands based on search input
 * Handles multi-word searches and prioritizes matches
 */
export function useCommandSearch({ formatCommands }: UseCommandSearchProps): UseCommandSearchReturn {
  const [commandSearch, setCommandSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filteredCommands = useMemo(() => {
    const commands = formatCommands;
    const searchTerm = commandSearch;
    const trimmedSearch = searchTerm.trim().toLowerCase();
    if (!trimmedSearch) return commands;

    // First prioritize exact matches for the command ID
    const exactIdMatches = commands.filter(
      (cmd) => cmd.id.toLowerCase() === trimmedSearch,
    );

    // Then prioritize commands that start with the search term
    const startsWithMatches = commands.filter((cmd) => {
      // Skip exact matches we already included
      if (exactIdMatches.some((m) => m.id === cmd.id)) return false;

      // Check if command ID or label starts with search term
      const idStartsWithTerm = cmd.id.toLowerCase().startsWith(trimmedSearch);
      const labelStartsWithTerm = cmd.label
        .toLowerCase()
        .startsWith(trimmedSearch);

      // Check if any keyword starts with search term
      let keywordStartsWithTerm = false;
      if (Array.isArray(cmd.keywords) && cmd.keywords.length > 0) {
        keywordStartsWithTerm = cmd.keywords.some((k) =>
          k.toLowerCase().startsWith(trimmedSearch),
        );
      }

      return idStartsWithTerm || labelStartsWithTerm || keywordStartsWithTerm;
    });

    // Finally include commands that contain the search term anywhere
    const containsMatches = commands.filter((cmd) => {
      // Skip commands we already included
      if (
        exactIdMatches.some((m) => m.id === cmd.id) ||
        startsWithMatches.some((m) => m.id === cmd.id)
      )
        return false;

      const cmdText = `${cmd.id} ${cmd.label}`.toLowerCase();
      if (cmdText.includes(trimmedSearch)) return true;

      // Check if any keyword contains the search term
      if (Array.isArray(cmd.keywords) && cmd.keywords.length > 0) {
        return cmd.keywords.some((keyword) =>
          keyword.toLowerCase().includes(trimmedSearch),
        );
      }

      return false;
    });

    // Combine all matches in priority order
    return [...exactIdMatches, ...startsWithMatches, ...containsMatches];
  }, [formatCommands, commandSearch]);
  
  return {
    filteredCommands,
    commandSearch,
    setCommandSearch,
    selectedIndex,
    setSelectedIndex
  };
}