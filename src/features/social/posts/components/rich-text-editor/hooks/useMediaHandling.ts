import { useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import type { Editor } from '@tiptap/react';
import { useDropzone } from 'react-dropzone';
import { ACCEPTED_IMAGE_TYPES, ACCEPTED_VIDEO_TYPES, ACCEPTED_AUDIO_TYPES } from '../constants';

interface UseMediaHandlingProps {
  editor: Editor | null;
  onMediaSelect?: (files: File[]) => void;
}

interface UseMediaHandlingReturn {
  mediaFiles: File[];
  setMediaFiles: (files: File[]) => void;
  isUploading: boolean;
  mediaType: 'image' | 'video' | 'audio';
  setMediaType: (type: 'image' | 'video' | 'audio') => void;
  mediaTab: 'upload' | 'embed';
  setMediaTab: (tab: 'upload' | 'embed') => void;
  showMediaPrompt: boolean;
  setShowMediaPrompt: (show: boolean) => void;
  embedUrl: string;
  setEmbedUrl: (url: string) => void;
  getRootProps: () => any;
  getInputProps: () => any;
  insertMediaToEditor: (src: string, type: 'image' | 'video' | 'audio') => void;
  handleFileChange: (files: File[]) => void;
  cancelMediaSelection: () => void;
  confirmMediaSelection: () => void;
}

/**
 * Hook to manage media uploads and selection
 */
export function useMediaHandling({
  editor,
  onMediaSelect,
}: UseMediaHandlingProps): UseMediaHandlingReturn {
  // Media state
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'audio'>('image');
  const [mediaTab, setMediaTab] = useState<'upload' | 'embed'>('upload');
  const [showMediaPrompt, setShowMediaPrompt] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');
  
  const { toast } = useToast();

  // Get the accepted file types based on the media type
  const getAcceptedFileTypes = useCallback(() => {
    switch (mediaType) {
      case 'image':
        return ACCEPTED_IMAGE_TYPES;
      case 'video':
        return ACCEPTED_VIDEO_TYPES;
      case 'audio':
        return ACCEPTED_AUDIO_TYPES;
      default:
        return {};
    }
  }, [mediaType]);

  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      
      // Filter files based on media type
      const filteredFiles = acceptedFiles.filter((file) => {
        const fileType = file.type.split('/')[0];
        return fileType === mediaType;
      });
      
      if (filteredFiles.length === 0) {
        toast({
          title: 'Invalid file type',
          description: `Please upload a ${mediaType} file.`,
          variant: 'destructive',
        });
        return;
      }
      
      // Add files to the media files array
      setMediaFiles((prev) => [...prev, ...filteredFiles]);
    },
    [mediaType, toast]
  );

  // Configure dropzone
  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: getAcceptedFileTypes(),
    maxFiles: 4,
    maxSize: 10485760, // 10MB
  });

  // Insert media into the editor
  const insertMediaToEditor = useCallback(
    (src: string, type: 'image' | 'video' | 'audio') => {
      if (!editor) return;
      
      try {
        // Focus the editor
        editor.commands.focus();
        
        // Insert the media based on type
        if (type === 'image') {
          editor.commands.insertContent(`<img src="${src}" alt="Uploaded image" />`);
        } else if (type === 'video') {
          editor.commands.insertContent(`<video src="${src}" controls></video>`);
        } else if (type === 'audio') {
          editor.commands.insertContent(`<audio src="${src}" controls></audio>`);
        }
      } catch (error) {
        // Handle error
        toast({
          title: 'Error inserting media',
          description: 'An error occurred while inserting the media.',
          variant: 'destructive',
        });
      }
    },
    [editor, toast]
  );

  // Handle file change
  const handleFileChange = useCallback(
    (files: File[]) => {
      setMediaFiles(files);
    },
    []
  );

  // Cancel media selection
  const cancelMediaSelection = useCallback(() => {
    setShowMediaPrompt(false);
    setMediaFiles([]);
    setEmbedUrl('');
  }, []);

  // Confirm media selection
  const confirmMediaSelection = useCallback(() => {
    if (mediaFiles.length === 0 && !embedUrl) {
      toast({
        title: 'No media selected',
        description: 'Please select a file or enter a URL.',
        variant: 'destructive',
      });
      return;
    }
    
    // If there are files, call the onMediaSelect callback
    if (mediaFiles.length > 0 && onMediaSelect) {
      setIsUploading(true);
      
      // Simulate upload
      setTimeout(() => {
        onMediaSelect(mediaFiles);
        setIsUploading(false);
        setShowMediaPrompt(false);
        setMediaFiles([]);
      }, 1000);
    } else if (embedUrl) {
      // Handle embed URL
      insertMediaToEditor(embedUrl, mediaType);
      setShowMediaPrompt(false);
      setEmbedUrl('');
    }
  }, [mediaFiles, embedUrl, mediaType, onMediaSelect, insertMediaToEditor, toast]);

  return {
    mediaFiles,
    setMediaFiles,
    isUploading,
    mediaType,
    setMediaType,
    mediaTab,
    setMediaTab,
    showMediaPrompt,
    setShowMediaPrompt,
    embedUrl,
    setEmbedUrl,
    getRootProps,
    getInputProps,
    insertMediaToEditor,
    handleFileChange,
    cancelMediaSelection,
    confirmMediaSelection,
  };
}
