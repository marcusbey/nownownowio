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
    
    // Calculate a score for each command based on how well it matches the search
    const scoredCommands = commands.map(cmd => {
      let score = 0;
      
      // Highest priority: exact ID match (score: 100)
      if (cmd.id.toLowerCase() === trimmedSearch) {
        score = 100;
        return { cmd, score };
      }
      
      // High priority: exact keyword match (score: 90)
      if (Array.isArray(cmd.keywords) && cmd.keywords.some(k => k.toLowerCase() === trimmedSearch)) {
        score = 90;
        return { cmd, score };
      }
      
      // Medium-high priority: ID starts with search term (score: 80)
      if (cmd.id.toLowerCase().startsWith(trimmedSearch)) {
        score = 80;
        return { cmd, score };
      }
      
      // Medium priority: label starts with search term (score: 70)
      if (cmd.label.toLowerCase().startsWith(trimmedSearch)) {
        score = 70;
        return { cmd, score };
      }
      
      // Medium-low priority: keyword starts with search term (score: 60)
      if (Array.isArray(cmd.keywords) && cmd.keywords.some(k => k.toLowerCase().startsWith(trimmedSearch))) {
        score = 60;
        return { cmd, score };
      }
      
      // Low priority: ID or label contains search term (score: 40-50)
      if (cmd.id.toLowerCase().includes(trimmedSearch)) {
        score = 50;
        return { cmd, score };
      }
      
      if (cmd.label.toLowerCase().includes(trimmedSearch)) {
        score = 45;
        return { cmd, score };
      }
      
      // Lowest priority: keyword contains search term (score: 30)
      if (Array.isArray(cmd.keywords) && cmd.keywords.some(k => k.toLowerCase().includes(trimmedSearch))) {
        score = 30;
        return { cmd, score };
      }
      
      // No match
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