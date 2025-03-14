"use client";

import { Button } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { useUploadThing } from "@/lib/uploadthing-client";
import { Image, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

type BannerImageFormProps = {
  user: {
    id: string;
    name: string | null;
    bannerImage?: string | null;
  };
};

export function BannerImageForm({ user }: BannerImageFormProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    user.bannerImage ?? null,
  );
  const { startUpload } = useUploadThing("bannerImage");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image is too large. Maximum size is 2MB.");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed.");
      return;
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload file
    setIsUploading(true);
    try {
      const uploadResult = await startUpload([file]);
      if (!uploadResult || uploadResult.length === 0) {
        throw new Error("Upload failed");
      }

      toast.success("Banner image updated successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to upload banner image");
      console.error(error);
      // Reset preview on error
      setPreviewUrl(user.bannerImage ?? null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveBanner = async () => {
    setIsUploading(true);
    try {
      const response = await fetch("/api/v1/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bannerImage: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove banner image");
      }

      setPreviewUrl(null);
      toast.success("Banner image removed successfully");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove banner image",
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="border-border bg-background">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Profile Banner</CardTitle>
        <CardDescription>
          Customize your profile with a banner image
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative h-32 w-full overflow-hidden rounded-md border border-border">
            {previewUrl ? (
              <>
                <img
                  src={previewUrl}
                  alt="Banner image"
                  className="size-full object-cover"
                />
                <Button
                  variant="destructive"
                  className="absolute right-2 top-2 size-8 border border-border bg-background/80 text-foreground hover:bg-background/90"
                  onClick={handleRemoveBanner}
                  disabled={isUploading}
                >
                  <X className="size-4" />
                </Button>
              </>
            ) : (
              <div className="flex size-full items-center justify-center bg-muted/30">
                <Image className="size-8 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Recommended size: 1500 x 500 pixels (max 2MB)
            </div>
            <div className="relative">
              <input
                type="file"
                id="banner-upload"
                className="absolute inset-0 size-full cursor-pointer opacity-0"
                onChange={handleFileChange}
                accept="image/*"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                className="flex items-center gap-2"
                disabled={isUploading}
              >
                <Upload className="size-4" />
                {isUploading ? "Uploading..." : "Upload Banner"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
