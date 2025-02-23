"use client";

import * as React from "react";
import { useCallback } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/composite/command";

export type FormatCommand = {
  id: string;
  label: string;
  command: string;
  format: (text: string) => string;
};

const formatCommands: FormatCommand[] = [
  { 
    id: "h1", 
    label: "Heading 1", 
    command: "h1", 
    format: (text) => `# ${text}` 
  },
  { 
    id: "h2", 
    label: "Heading 2", 
    command: "h2", 
    format: (text) => `## ${text}` 
  },
  { 
    id: "h3", 
    label: "Heading 3", 
    command: "h3", 
    format: (text) => `### ${text}` 
  },
  { 
    id: "bullet", 
    label: "Bulleted List", 
    command: "bullet", 
    format: (text) => `- ${text}` 
  },
  { 
    id: "numbered", 
    label: "Numbered List", 
    command: "numbered", 
    format: (text) => `1. ${text}` 
  },
  { 
    id: "todo", 
    label: "Todo", 
    command: "todo", 
    format: (text) => `- [ ] ${text}` 
  },
  { 
    id: "divider", 
    label: "Divider", 
    command: "divider", 
    format: (text) => `${text}\n---\n` 
  },
  { 
    id: "quote", 
    label: "Quote", 
    command: "quote", 
    format: (text) => `> ${text}` 
  },
  { 
    id: "code", 
    label: "Code Block", 
    command: "code", 
    format: (text) => `\`\`\`\n${text}\n\`\`\`` 
  },
  { 
    id: "callout", 
    label: "Callout", 
    command: "callout", 
    format: (text) => `💡 ${text}` 
  },
];

interface CommandMenuProps {
  onSelect: (command: FormatCommand) => void;
  isOpen: boolean;
  onClose: () => void;
  filter: string;
}

export function CommandMenu({ onSelect, isOpen, onClose, filter }: CommandMenuProps): JSX.Element | null {
  /**
   * Filters commands based on the input search string.
   * Handles multi-word searches by skipping non-matching words and filtering based on matching words.
   */
  const filteredCommands = React.useMemo(() => {
    const searchWords = filter.trim().toLowerCase().split(/\s+/);
    if (searchWords.length === 0 || !filter.trim()) return formatCommands;

    // Find the first word that matches any command
    let startIndex = -1;
    for (let i = 0; i < searchWords.length; i++) {
      const word = searchWords[i];
      const matches = formatCommands.some(cmd => {
        const cmdText = (cmd.command + " " + cmd.label).toLowerCase();
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
    return formatCommands.filter(cmd => {
      const cmdText = (cmd.command + " " + cmd.label).toLowerCase();
      return relevantWords.every(word => cmdText.includes(word));
    });
  }, [filter]);

  const handleSelect = useCallback((cmd: FormatCommand) => {
    onSelect(cmd);
    onClose();
  }, [onSelect, onClose]);

  // If there's exactly one match and it starts with the filter, select it
  React.useEffect(() => {
    if (filter && filteredCommands.length === 1 && 
        filteredCommands[0].command.toLowerCase().startsWith(filter.toLowerCase())) {
      handleSelect(filteredCommands[0]);
    }
  }, [filter, filteredCommands, handleSelect]);

  if (!isOpen) return null;

  return (
    <div className="absolute bottom-full left-0 mb-1 w-64">
      <Command className="border border-border shadow-md">
        <CommandInput
          value={filter}
          onValueChange={(newFilter) => {
            // Update filter in parent component if needed
            // For now, filter is controlled externally
          }}
          placeholder="/Filter..."
        />
        <CommandList className="max-h-[120px] overflow-y-auto">
          <CommandEmpty className="p-2 text-sm text-gray-500 dark:text-gray-400">
            No results found.
          </CommandEmpty>
          <CommandGroup>
            {filteredCommands.map((cmd) => (
              <CommandItem
                key={cmd.id}
                value={cmd.command}
                onSelect={() => handleSelect(cmd)}
                className="cursor-pointer hover:bg-accent"
              >
                {cmd.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

export { formatCommands };