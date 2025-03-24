"use client";

import { Loader } from "@/components/feedback/loader";
import { useUploadThing } from "@/lib/uploadthing-client";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { NativeTargetBox } from "./native-target-box";

type OrganizationImageUploaderProps = {
  onChange: (url: string) => void;
  imageUrl?: string | null;
  className?: string;
  type: "logo" | "banner";
  maxSizeMB?: number;
};

export function OrganizationImageUploader({
  onChange,
  imageUrl,
  className,
  type,
  maxSizeMB = 2,
}: OrganizationImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);

  // Use the appropriate UploadThing endpoint based on type
  const { startUpload: startLogoUpload, isUploading: isLogoUploading } =
    useUploadThing(type === "logo" ? "orgLogo" : "orgBanner");

  const handleDrop = useCallback(
    async (item: { files: File[] }) => {
      const file = item.files[0] as File;

      // Validate file type
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        toast.error("Invalid file type", {
          description: "Only PNG, JPG, JPEG, and WebP images are allowed",
        });
        return;
      }

      // Validate file size
      const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
      if (file.size > maxSize) {
        toast.error(`File too large (max ${maxSizeMB}MB)`, {
          description: "Try compressing the image before uploading",
        });
        return;
      }

      try {
        setIsUploading(true);
        console.log(`Starting ${type} upload for file:`, file.name);

        // Upload the file using UploadThing
        const uploadResult = await startLogoUpload([file]);

        if (!uploadResult || uploadResult.length === 0) {
          throw new Error("Upload failed");
        }

        // Get the URL from the upload result
        const uploadedUrl = uploadResult[0].url;

        if (!uploadedUrl) {
          throw new Error("No URL returned from upload");
        }

        console.log(`Upload succeeded for ${type}, raw URL:`, uploadedUrl);

        // Make sure we have the correct URL format with app ID
        let finalUrl = uploadedUrl;
        const appId = process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID;

        if (typeof appId === "string" && appId) {
          if (finalUrl.includes("utfs.io/f/")) {
            // Extract file ID and create proper URL with app ID
            const fileId = finalUrl.split("utfs.io/f/")[1].split("?")[0];
            finalUrl = `https://utfs.io/a/${appId}/${fileId}`;
            console.log(`Fixed ${type} URL with app ID:`, finalUrl);
          } else if (!finalUrl.includes(`/a/${appId}/`)) {
            console.warn(
              `${type} URL doesn't follow expected format:`,
              finalUrl,
            );
          }
        }

        console.log(`Final ${type} URL sent to onChange:`, finalUrl);

        // Call the onChange callback with the final URL
        onChange(finalUrl);

        toast.success(
          `${type === "logo" ? "Logo" : "Banner"} uploaded successfully`,
        );
      } catch (error) {
        console.error(`Upload error for ${type}:`, error);
        toast.error(`Failed to upload ${type === "logo" ? "logo" : "banner"}`, {
          description:
            error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally {
        setIsUploading(false);
      }
    },
    [maxSizeMB, onChange, startLogoUpload, type],
  );

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted rounded-md group",
        type === "logo" ? "aspect-square" : "aspect-[4/1]",
        className,
      )}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          className="absolute inset-0 size-full object-cover"
          alt={type === "logo" ? "Organization logo" : "Organization banner"}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          <svg
            className="size-12"
            fill="none"
            height="24"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            width="24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
            <line x1="16" x2="22" y1="5" y2="5" />
            <line x1="19" x2="19" y1="2" y2="8" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
        </div>
      )}

      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity flex items-center justify-center",
          {
            "group-hover:bg-background/70 group-hover:opacity-100":
              !isUploading,
            "bg-background/70 opacity-100": isUploading,
          },
        )}
      >
        {isUploading || isLogoUploading ? (
          <Loader />
        ) : (
          <NativeTargetBox
            className="absolute inset-0 flex h-auto items-center justify-center"
            isLoading={false}
            onDrop={handleDrop}
            accept={["*.png", "*.jpg", "*.jpeg", "*.webp"]}
          >
            <div className="p-4 text-center">
              <p className="text-sm font-medium">
                {type === "logo" ? "Upload Logo" : "Upload Banner"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drag & drop or click to browse
              </p>
            </div>
          </NativeTargetBox>
        )}
      </div>
    </div>
  );
}
