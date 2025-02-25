"use client";

import { useOrganization } from "@/features/organization/hooks/use-organization";
import { PostForm as BasePostForm } from "@/features/social/posts/post-form";
import { useSession } from "next-auth/react";
import { useCallback, useRef, useState } from "react";

// Replace your simple SLASH_COMMANDS array with something that includes "transform"
const SLASH_COMMANDS = [
  {
    label: "Heading 1",
    trigger: "heading1",
    transform: (line: string) => `# ${line || "Heading 1"}`,
  },
  {
    label: "Heading 2",
    trigger: "heading2",
    transform: (line: string) => `## ${line || "Heading 2"}`,
  },
  {
    label: "Heading 3",
    trigger: "heading3",
    transform: (line: string) => `### ${line || "Heading 3"}`,
  },
  {
    label: "Bulleted List",
    trigger: "bullet",
    transform: (line: string) => `- ${line}`,
  },
  {
    label: "Numbered List",
    trigger: "numbered",
    transform: (line: string) => `1. ${line}`,
  },
  {
    label: "Todo",
    trigger: "todo",
    transform: (line: string) => `- [ ] ${line}`,
  },
  {
    label: "Divider",
    trigger: "divider",
    transform: () => `\n---\n`,
  },
  {
    label: "Quote",
    trigger: "quote",
    transform: (line: string) => `> ${line}`,
  },
  {
    label: "Code",
    trigger: "code",
    transform: (line: string) => `\`\`\`\n${line}\n\`\`\``,
  },
  {
    label: "Callout",
    trigger: "callout",
    transform: (line: string) => `💡 ${line}`,
  },
];

export default function PostForm() {
  const { data: session, status } = useSession();
  const { organization } = useOrganization();

  const [text, setText] = useState("");
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const [filteredCommands, setFilteredCommands] = useState(SLASH_COMMANDS);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setText(newValue);

      // Check if user typed "/" and show menu
      const slashIndex = newValue.lastIndexOf("/");
      if (slashIndex !== -1) {
        const commandText = newValue.slice(slashIndex + 1).toLowerCase();
        const matched = SLASH_COMMANDS.filter((cmd) =>
          cmd.trigger.toLowerCase().startsWith(commandText),
        );
        setFilteredCommands(matched);
        setShowSlashMenu(matched.length > 0);
      } else {
        setShowSlashMenu(false);
      }
    },
    [],
  );

  const handleSelectCommand = useCallback(
    (command: (typeof SLASH_COMMANDS)[number]) => {
      // Replace the "/xxx" part with the chosen format
      const slashIndex = text.lastIndexOf("/");
      if (slashIndex !== -1) {
        const currentLine = text.slice(
          slashIndex + 1,
          slashIndex + 1 + command.trigger.length,
        );
        // The line text excluding the slash command
        const lineRemainder = text
          .slice(slashIndex + 1 + currentLine.length, text.length)
          .trimStart();
        // Transform the line using the command's transform function
        const updatedLine = command.transform(lineRemainder);

        const updatedText = text.slice(0, slashIndex) + updatedLine;
        setText(updatedText);
      }
      setShowSlashMenu(false);
    },
    [text],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (showSlashMenu && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        if (filteredCommands.length > 0) {
          handleSelectCommand(filteredCommands[0]);
        } else {
          setShowSlashMenu(false);
        }
      }
    },
    [filteredCommands, handleSelectCommand, showSlashMenu],
  );

  if (status === "loading") {
    return (
      <div className="sticky top-0 z-10 bg-background/80 p-4 backdrop-blur-sm">
        <div className="flex items-center justify-center p-4">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (!session?.user?.id || !organization) {
    return (
      <div className="sticky top-0 z-10 bg-background/80 p-4 backdrop-blur-sm">
        <div className="text-center">
          {!session?.user?.id
            ? "Please log in to create posts."
            : "Organization not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-0 z-10 bg-background/80 p-4 backdrop-blur-sm">
      <BasePostForm
        organization={{
          id: organization.id,
          name: organization.name,
        }}
        userId={session.user.id}
      />

      {/* The slash commands text area */}
      <textarea
        ref={textareaRef}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type / for formatting... e.g. /quote, /bullet, /todo"
        className="mt-3 w-full rounded border p-2"
      />

      {showSlashMenu && (
        <ul className="absolute mt-1 rounded border bg-white p-2 shadow">
          {filteredCommands.map((cmd) => (
            <li
              key={cmd.trigger}
              onClick={() => handleSelectCommand(cmd)}
              className="cursor-pointer px-2 py-1 hover:bg-gray-200"
            >
              {cmd.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
