import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
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

    // If no search term, return all commands
    if (!trimmedSearch) return commands;

    // For multi-word searches, split into individual terms
    const searchTerms = trimmedSearch.split(/\s+/).filter(term => term.length > 0);

    // Calculate a score for each command based on how well it matches the search
    const scoredCommands = commands.map(cmd => {
      let score = 0;

      // For each search term, calculate a match score
      searchTerms.forEach(term => {
        // Highest priority: exact ID match (score: 100)
        if (cmd.id.toLowerCase() === term) {
          score += 100;
        }

        // High priority: exact keyword match (score: 90)
        // Ensure keywords is an array before using some()
        if (cmd.keywords && Array.isArray(cmd.keywords)) {
          const hasExactKeyword = cmd.keywords.some(
            keyword => typeof keyword === 'string' && keyword.toLowerCase() === term
          );
          if (hasExactKeyword) {
            score += 90;
          }

          // Medium-low priority: keyword starts with search term (score: 60)
          const hasKeywordStartingWith = cmd.keywords.some(
            keyword => typeof keyword === 'string' && keyword.toLowerCase().startsWith(term)
          );
          if (hasKeywordStartingWith) {
            score += 60;
          }

          // Lowest priority: keyword contains search term (score: 30)
          const hasKeywordContaining = cmd.keywords.some(
            keyword => typeof keyword === 'string' && keyword.toLowerCase().includes(term)
          );
          if (hasKeywordContaining) {
            score += 30;
          }
        }

        // Medium-high priority: ID starts with search term (score: 80)
        if (cmd.id.toLowerCase().startsWith(term)) {
          score += 80;
        }

        // Medium priority: label starts with search term (score: 70)
        if (cmd.label.toLowerCase().startsWith(term)) {
          score += 70;
        }

        // Low priority: ID or label contains search term (score: 40-50)
        if (cmd.id.toLowerCase().includes(term)) {
          score += 50;
        }

        if (cmd.label.toLowerCase().includes(term)) {
          score += 45;
        }
      });

      // Return the command and its total score
      return { cmd, score };
    });

    // Filter out non-matches and sort by score (highest first)
    const filteredAndSorted = scoredCommands
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);

    // Return just the commands in order
    return filteredAndSorted.map(item => item.cmd);
  }, [formatCommands, commandSearch]);

  return {
    filteredCommands,
    commandSearch,
    setCommandSearch,
    selectedIndex,
    setSelectedIndex
  };
}