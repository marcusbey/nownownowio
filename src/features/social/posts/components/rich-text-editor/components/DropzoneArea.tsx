import React from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DropzoneAreaProps {
  onDrop: (acceptedFiles: File[]) => void;
  mediaType: "image" | "video" | "audio";
}

/**
 * A reusable dropzone area component for handling file uploads
 */
export const DropzoneArea: React.FC<DropzoneAreaProps> = ({
  onDrop,
  mediaType
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: mediaType === "image" ? { 'image/*': [] } : 
            mediaType === "video" ? { 'video/*': [] } : 
            { 'audio/*': [] }
  });
  
  return (
    <div
      {...getRootProps()}
      className={cn(
        "mb-4 cursor-pointer rounded-md border-2 border-dashed p-4 transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/20 hover:border-muted-foreground/50",
      )}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-sm text-muted-foreground">
        <ImagePlus className="mb-2 size-6" />
        <p>
          {isDragActive
            ? "Drop files here"
            : `Drag & drop or click to add ${mediaType === "image" ? "images" : mediaType === "video" ? "videos" : "audio files"}`}
        </p>
        <p className="mt-1 text-xs">
          {mediaType === "image"
            ? "Up to 4 files (4MB per image)"
            : mediaType === "video"
              ? "Up to 4 files (64MB per video)"
              : "Up to 4 files (16MB per audio file)"}
        </p>
      </div>
    </div>
  );
};

export default DropzoneArea;
