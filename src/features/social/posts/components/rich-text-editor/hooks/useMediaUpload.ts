import { useCallback, useState } from "react";
import { useToast } from "@/components/feedback/use-toast";
import type React from "react";
import type { Editor } from "@tiptap/react";
import type { MediaFile } from "../types";
import { MAX_MEDIA_FILES } from "../constants";

type UseMediaUploadOptions = {
  onMediaSelect?: (files: File[]) => void;
  editor?: Editor | null;
}

type UseMediaUploadReturn = {
  mediaFiles: MediaFile[];
  mediaType: "image" | "video" | "audio";
  mediaTab: "upload" | "embed";
  isUploading: boolean;
  embedUrl: string;
  showMediaPrompt: boolean;
  setShowMediaPrompt: React.Dispatch<React.SetStateAction<boolean>>;
  setMediaType: (type: "image" | "video" | "audio") => void;
  setMediaTab: (tab: "upload" | "embed") => void;
  setEmbedUrl: (url: string) => void;
  onDrop: (acceptedFiles: File[]) => void;
  removeMedia: (index: number) => void;
  insertMediaToEditor: (src: string, type: "image" | "video" | "audio") => void;
  confirmMediaSelection: () => void;
  cancelMediaSelection: () => void;
  resetMediaState: () => void;
}

/**
 * Hook to handle media upload functionality for the rich text editor
 */
export function useMediaUpload({
  onMediaSelect,
  editor,
}: UseMediaUploadOptions): UseMediaUploadReturn {
  const { toast } = useToast();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image");
  const [mediaTab, setMediaTab] = useState<"upload" | "embed">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [showMediaPrompt, setShowMediaPrompt] = useState(false);

  /**
   * Handle file drop for media uploads
   */
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // Check if adding these files would exceed the limit
      if (mediaFiles.length + acceptedFiles.length > MAX_MEDIA_FILES) {
        toast({
          title: "Too many files",
          description: `You can only upload up to ${MAX_MEDIA_FILES} files per post`,
          variant: "destructive",
        });
        return;
      }

      // Process each file
      const newMediaFiles = acceptedFiles
        .filter((file) => {
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");
          const isAudio = file.type.startsWith("audio/");

          // Only accept files that match the current media type
          if (mediaType === "image" && !isImage) {
            toast({
              title: "Unsupported file type",
              description: "Only image files are supported for this upload",
              variant: "destructive",
            });
            return false;
          } else if (mediaType === "video" && !isVideo) {
            toast({
              title: "Unsupported file type",
              description: "Only video files are supported for this upload",
              variant: "destructive",
            });
            return false;
          } else if (mediaType === "audio" && !isAudio) {
            toast({
              title: "Unsupported file type",
              description: "Only audio files are supported for this upload",
              variant: "destructive",
            });
            return false;
          }

          // Check file size
          const maxSize = 10 * 1024 * 1024; // 10MB
          if (file.size > maxSize) {
            toast({
              title: "File too large",
              description: "Files must be less than 10MB",
              variant: "destructive",
            });
            return false;
          }

          return true;
        })
        .map((file) => {
          const isImage = file.type.startsWith("image/");
          const isVideo = file.type.startsWith("video/");

          return {
            file,
            previewUrl: URL.createObjectURL(file),
            type: isImage ? "image" : isVideo ? "video" : "audio",
            uploading: false,
            progress: 0,
          } as MediaFile;
        });

      if (newMediaFiles.length > 0) {
        setMediaFiles((prev) => [...prev, ...newMediaFiles]);
        if (onMediaSelect) {
          onMediaSelect(newMediaFiles.map((media) => media.file));
        }
      }
    },
    [mediaFiles, mediaType, onMediaSelect, toast]
  );

  /**
   * Remove a media file from the list
   */
  const removeMedia = useCallback(
    (index: number) => {
      setMediaFiles((prev) => {
        const newFiles = [...prev];
        // Revoke the object URL to prevent memory leaks
        URL.revokeObjectURL(newFiles[index].previewUrl);
        newFiles.splice(index, 1);
        return newFiles;
      });
    },
    []
  );

  /**
   * Insert media into the editor
   */
  const insertMediaToEditor = useCallback(
    (src: string, type: "image" | "video" | "audio") => {
      if (!editor?.isEditable) return;

      // Insert at current cursor position
      editor.commands.focus();

      if (type === "image") {
        editor.commands.insertContent({
          type: "mediaNode",
          attrs: {
            src,
            alt: "Uploaded image",
            type: "image",
          },
        });
      } else if (type === "video") {
        editor.commands.insertContent({
          type: "mediaNode",
          attrs: {
            src,
            alt: "Uploaded video",
            type: "video",
          },
        });
      } else {
        // This is the audio case
        editor.commands.insertContent({
          type: "mediaNode",
          attrs: {
            src,
            alt: "Uploaded audio",
            type: "audio",
          },
        });
      }

      // Add a paragraph after the media if we're at the end of the document
      const { state } = editor;
      const { $anchor } = state.selection;
      const isAtEnd = $anchor.pos === state.doc.content.size;

      if (isAtEnd) {
        editor.commands.insertContent("<p></p>");
      }
    },
    [editor]
  );

  /**
   * Reset media state
   */
  const resetMediaState = useCallback(() => {
    // Clean up object URLs to prevent memory leaks
    mediaFiles.forEach((media) => {
      URL.revokeObjectURL(media.previewUrl);
    });
    
    setMediaFiles([]);
    setEmbedUrl("");
    setIsUploading(false);
  }, [mediaFiles]);
  
  /**
   * Cancel media selection
   */
  const cancelMediaSelection = useCallback(() => {
    resetMediaState();
  }, [resetMediaState]);

  /**
   * Confirm media selection and insert into editor
   */
  const confirmMediaSelection = useCallback(() => {
    if (mediaTab === "upload") {
      // Insert all uploaded media files
      mediaFiles.forEach((media) => {
        insertMediaToEditor(media.previewUrl, media.type);
      });
    } else if (embedUrl.trim()) {
      // Insert embed URL (this is the embed case)
      insertMediaToEditor(embedUrl.trim(), mediaType);
    }

    // Reset state
    resetMediaState();
  }, [mediaTab, mediaFiles, embedUrl, mediaType, insertMediaToEditor, resetMediaState]);

  return {
    mediaFiles,
    mediaType,
    mediaTab,
    isUploading,
    embedUrl,
    showMediaPrompt,
    setShowMediaPrompt,
    setMediaType,
    setMediaTab,
    setEmbedUrl,
    onDrop,
    removeMedia,
    insertMediaToEditor,
    confirmMediaSelection,
    cancelMediaSelection,
    resetMediaState,
  };
}