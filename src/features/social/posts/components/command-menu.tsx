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
  // Filter commands based on input
  const filteredCommands = React.useMemo(() => 
    formatCommands.filter(cmd =>
      cmd.command.toLowerCase().includes((filter || "").toLowerCase()) ||
      cmd.label.toLowerCase().includes((filter || "").toLowerCase())
    ), [filter]
  );

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
        <CommandList className="max-h-[120px] overflow-y-auto">
          <CommandEmpty>No commands found.</CommandEmpty>
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
