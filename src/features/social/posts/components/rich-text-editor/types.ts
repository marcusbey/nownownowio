import type { Editor } from "@tiptap/react";
import type { ReactNode, Dispatch, SetStateAction } from "react";
import type { DropzoneRootProps, DropzoneInputProps } from "react-dropzone";

export type FormatCommand = {
  id: string;
  label: string;
  icon: string;
  keywords?: string[];
};

export type MediaFile = {
  file: File;
  id?: string;
  previewUrl: string;
  type: "image" | "video" | "audio";
  uploading: boolean;
  progress: number;
  error?: string;
};

export type MenuPosition = {
  x: number;
  y: number;
};

export type RichTextEditorProps = {
  onChange?: (content: string) => void;
  onEmojiSelect?: (emoji: string) => void;
  onMediaSelect?: (files: File[]) => void;
  maxLength?: number;
  initialContent?: string;
  placeholder?: string;
  autofocus?: boolean;
  children?: ReactNode;
};

export type RichTextEditorRef = {
  clearEditor: () => void;
  getEditor: () => Editor | null;
};

export type CommandMenuProps = {
  editor: Editor | null;
  showCommandMenu: boolean;
  setShowCommandMenu: Dispatch<SetStateAction<boolean>>;
  menuPosition: MenuPosition;
  commandSearch: string;
  setCommandSearch: Dispatch<SetStateAction<string>>;
  selectedIndex: number;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
  filteredCommands: FormatCommand[];
  applyFormat: (command: FormatCommand) => void;
};

export type LinkPromptProps = {
  editor: Editor | null;
  showLinkPrompt: boolean;
  setShowLinkPrompt: (show: boolean) => void;
  linkUrl: string;
  setLinkUrl: (url: string) => void;
  applyLink: () => void;
  cancelLink: () => void;
};

export type MediaPromptProps = {
  mediaFiles: MediaFile[];
  mediaType: "image" | "video" | "audio";
  mediaTab: "upload" | "embed";
  isUploading: boolean;
  embedUrl: string;
  setMediaType: (type: "image" | "video" | "audio") => void;
  setMediaTab: (tab: "upload" | "embed") => void;
  setEmbedUrl: (url: string) => void;
  onDrop: (acceptedFiles: File[]) => void;
  removeMedia: (index: number) => void;
  confirmMediaSelection: () => void;
  cancelMediaSelection: () => void;
  getRootProps: (props?: Record<string, unknown>) => DropzoneRootProps;
  getInputProps: (props?: Record<string, unknown>) => DropzoneInputProps;
  isDragActive: boolean;
};

export type UseMediaUploadReturn = {
  mediaFiles: MediaFile[];
  isUploading: boolean;
  onDrop: (acceptedFiles: File[]) => void;
  removeMedia: (index: number) => void;
  insertMediaToEditor: (src: string, type: "image" | "video" | "audio") => void;
  showMediaPrompt: boolean;
  setShowMediaPrompt: (show: boolean) => void;
  confirmMediaSelection: () => void;
  cancelMediaSelection: () => void;
};

export type UseMediaUploadOptions = {
  editor: Editor | null;
  onMediaSelect?: (files: File[]) => void;
  toast?: {
    error: (message: string) => void;
    success: (message: string) => void;
  };
};

export type AcceptedFileTypes = Record<string, string[]>;

export type UseLinkInsertionReturn = {
  showLinkPrompt: boolean;
  initialUrl: string;
  openLinkPrompt: () => void;
  closeLinkPrompt: () => void;
  confirmLink: (url: string) => void;
};

export type UseLinkInsertionOptions = {
  editor: Editor | null;
};