import { useUploadThing } from "@/lib/uploadthing-client";
import type { Editor } from "@tiptap/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { MediaFile } from "../types";

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
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [mediaType, setMediaType] = useState<"image" | "video" | "audio">("image");
  const [mediaTab, setMediaTab] = useState<"upload" | "embed">("upload");
  const [isUploading, setIsUploading] = useState(false);
  const [embedUrl, setEmbedUrl] = useState("");
  const [showMediaPrompt, setShowMediaPrompt] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [uploadAttempts, setUploadAttempts] = useState(0);

  // Initialize UploadThing
  const { startUpload, isUploading: isUploadingFile } = useUploadThing("postMedia", {
    onClientUploadComplete: (res) => {
      if (!res[0]) return;

      // Update the media file with the uploaded URL
      setMediaFiles((prev) =>
        prev.map((file, index) => {
          if (index === 0) { // Update only the first file as UploadThing processes one at a time
            return {
              ...file,
              previewUrl: res[0].url,
              uploading: false,
              progress: 100
            };
          }
          return file;
        })
      );

      setUploadInProgress(false);
      setUploadAttempts(0);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      toast.error("Failed to upload media. Please try again.");
      setUploadInProgress(false);

      // Increment upload attempts
      setUploadAttempts((prev) => prev + 1);

      // If we've tried 3 times, show a different error
      if (uploadAttempts >= 2) {
        toast.error("Multiple upload attempts failed. Please try again later.");
        resetMediaState();
      }
    },
    onUploadProgress: (progress) => {
      // Update progress for the current file
      setMediaFiles((prev) =>
        prev.map((file, index) => {
          if (index === 0) { // Update only the first file
            return {
              ...file,
              progress: progress
            };
          }
          return file;
        })
      );
    },
  });

  /**
   * Handle file drop for media uploads with better de-duplication
   */
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Validate file types
      const validFiles = acceptedFiles.filter((file) => {
        const isImage = file.type.startsWith("image/");
        const isVideo = file.type.startsWith("video/");
        const isAudio = file.type.startsWith("audio/");

        // Check if file type matches selected media type
        switch (mediaType) {
          case "image":
            return isImage;
          case "video":
            return isVideo;
          case "audio":
            return isAudio;
          default:
            return false;
        }
      });

      if (validFiles.length === 0) {
        toast.error(`Please select valid ${mediaType} files. The selected files do not match the required format.`);
        return;
      }

      // Create preview URLs and add files to state
      const newMediaFiles = validFiles.map((file) => ({
        file,
        previewUrl: URL.createObjectURL(file),
        type: mediaType,
        uploading: true,
        progress: 0,
      }));

      setMediaFiles((prev) => [...prev, ...newMediaFiles]);

      // Start uploading files
      setUploadInProgress(true);
      try {
        await startUpload(validFiles);
      } catch (error) {
        console.error("Error starting upload:", error);
        toast.error("Failed to start upload. Please try again.");
        setUploadInProgress(false);
      }

      // Call onMediaSelect if provided
      if (onMediaSelect) {
        onMediaSelect(validFiles);
      }
    },
    [mediaType, onMediaSelect, startUpload],
  );

  /**
   * Remove a media file from the list
   */
  const removeMedia = useCallback(
    (index: number) => {
      setMediaFiles((prev) => {
        const newFiles = [...prev];
        // Revoke object URL to prevent memory leaks
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
    (url: string, type: "image" | "video" | "audio" = "image") => {
      if (!editor || !url) return;

      try {
        // Focus the editor
        editor.commands.focus();

        // For videos, ensure we're using the media proxy (even if it's a local blob URL)
        const processedUrl = type === "video" || url.includes("/api/v1/media-proxy")
          ? url
          : `/api/v1/media-proxy?url=${encodeURIComponent(url)}&t=${Date.now()}`;

        // Insert the media node
        editor.commands.insertContent({
          type: "mediaNode",
          attrs: {
            src: processedUrl,
            alt: type === "image" ? "User uploaded media" : undefined,
            type,
          },
        });

        // Insert a paragraph after the media
        editor.commands.insertContent("<p></p>");

        // Place cursor at the end
        editor.commands.focus("end");
      } catch (error) {
        console.error("Error inserting media:", error);
        toast.error("Failed to insert media. There was an error adding the media to the editor.");
      }
    },
    [editor],
  );

  /**
   * Reset all media state
   */
  const resetMediaState = useCallback(() => {
    // Clean up object URLs to prevent memory leaks
    mediaFiles.forEach((media) => {
      URL.revokeObjectURL(media.previewUrl);
    });

    setMediaFiles([]);
    setEmbedUrl("");
    setIsUploading(false);
    setShowMediaPrompt(false);
    setUploadInProgress(false);
    setUploadAttempts(0);
  }, [mediaFiles]);

  /**
   * Cancel media selection and clean up resources
   */
  const cancelMediaSelection = useCallback(() => {
    resetMediaState();
  }, [resetMediaState]);

  /**
   * Confirm media selection and insert into editor
   */
  const confirmMediaSelection = useCallback(() => {
    if (mediaTab === "upload") {
      if (mediaFiles.length === 0) return;

      // Check if any files are still uploading
      const hasUploadingFiles = mediaFiles.some(file => file.uploading);
      if (hasUploadingFiles) {
        toast.error("Please wait for all files to finish uploading.");
        return;
      }

      // Insert each media file
      mediaFiles.forEach((media) => {
        insertMediaToEditor(media.previewUrl, media.type);
      });
    } else if (embedUrl.trim()) {
      // Insert embed URL
      insertMediaToEditor(embedUrl.trim(), mediaType);
    }

    // Clean up
    mediaFiles.forEach((media) => {
      URL.revokeObjectURL(media.previewUrl);
    });
    resetMediaState();
  }, [
    mediaTab,
    mediaFiles,
    embedUrl,
    mediaType,
    insertMediaToEditor,
    resetMediaState,
  ]);

  return {
    mediaFiles,
    mediaType,
    mediaTab,
    isUploading: isUploadingFile || uploadInProgress,
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