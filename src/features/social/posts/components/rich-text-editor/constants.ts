import type { FormatCommand, AcceptedFileTypes } from './types';

export const DEFAULT_MAX_LENGTH = 860;

export const EDITOR_PLACEHOLDER = "What do you have in mind? Type \"/\" for commands...";


export const FORMAT_COMMANDS: FormatCommand[] = [
  { id: "text", label: "Text", icon: "¶", keywords: ["text", "paragraph"] },
  {
    id: "h1",
    label: "Heading 1",
    icon: "H1",
    keywords: ["heading", "title", "h1"],
  },
  {
    id: "h2",
    label: "Heading 2",
    icon: "H2",
    keywords: ["heading", "subtitle", "h2"],
  },
  {
    id: "h3",
    label: "Heading 3",
    icon: "H3",
    keywords: ["heading", "subtitle", "h3"],
  },
  {
    id: "divider",
    label: "Divider",
    icon: "---",
    keywords: ["divider", "separator", "line", "hr"],
  },
  {
    id: "bullet",
    label: "Bullet List",
    icon: "•",
    keywords: ["bullet", "list", "unordered"],
  },
  {
    id: "numbered",
    label: "Numbered List",
    icon: "1.",
    keywords: ["numbered", "list", "ordered"],
  },
  {
    id: "link",
    label: "Link",
    icon: "🔗",
    keywords: ["link", "url", "hyperlink"],
  },
  {
    id: "quote",
    label: "Quote",
    icon: '"',
    keywords: ["quote", "blockquote", "citation"],
  },
  {
    id: "code",
    label: "Code Block",
    icon: "<>",
    keywords: ["code", "codeblock", "programming"],
  },
  {
    id: "image",
    label: "Image",
    icon: "🖼️",
    keywords: ["image", "picture", "photo", "media"],
  },
  {
    id: "video",
    label: "Video",
    icon: "🎬",
    keywords: ["video", "movie", "clip", "media"],
  },
  {
    id: "audio",
    label: "Audio",
    icon: "🔊",
    keywords: ["audio", "sound", "music", "media"],
  },
];

export const PLACEHOLDER_TEXT = {
  FIRST_LINE: "What do you have in mind? Type \"/\" for commands...",
  OTHER_LINES: "Write something, Press '/' for commands...",
  DEFAULT: "Write, Type '/' for commands...",
  PARAGRAPH: "Write something, Press '/' for commands...",
  LIST_ITEM: "List item",
  ORDERED_LIST: "1. List item",
  BLOCKQUOTE: "Type a quote...",
  CODE_BLOCK: "Code"
};

export const ACCEPTED_FILE_TYPES: AcceptedFileTypes = {
  "image/*": [".png", ".jpg", ".jpeg", ".gif"],
  "video/*": [".mp4", ".webm", ".mov"],
  "audio/*": [".mp3", ".wav", ".ogg", ".m4a"],
};

export const MAX_MEDIA_FILES = 4;