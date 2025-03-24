"use client";

import { Button } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
import { ImageIcon, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const BannerImageSchema = z.object({
  bannerImage: z.string().nullable().optional(),
});

type BannerImageFormValues = z.infer<typeof BannerImageSchema>;

export function BannerImageForm({ user }: { user: User }) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  // Set initial preview from user data
  useEffect(() => {
    if (user.bannerImage) {
      setPreview(user.bannerImage);
    }
  }, [user.bannerImage]);

  const form = useForm<BannerImageFormValues>({
    resolver: zodResolver(BannerImageSchema),
    defaultValues: {
      bannerImage: user.bannerImage ?? null,
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      try {
        setIsUploading(true);

        // Create a preview for immediate feedback
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Create FormData and append the file
        const formData = new FormData();
        formData.append("file", file);

        // Upload the file using our server endpoint
        const response = await fetch("/api/v1/user/bannerUpload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload banner image");
        }

        const { url } = await response.json();

        // Update form value
        form.setValue("bannerImage", url);
        setPreview(url);

        // No need to save immediately - the API already updates the database
        toast.success("Banner image updated successfully");

        // Refresh the page to show updated data
        router.refresh();
      } catch (error) {
        toast.error("Failed to upload banner image");
        console.error(error);
        setPreview(user.bannerImage ?? null);
      } finally {
        setIsUploading(false);
      }
    },
    [form, user.bannerImage, router],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 4 * 1024 * 1024, // 4MB
  });

  const handleRemoveBanner = async () => {
    try {
      setIsUploading(true);
      setPreview(null);
      form.setValue("bannerImage", null);

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

      toast.success("Banner image removed");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove banner image");
      setPreview(user.bannerImage ?? null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Banner Image</CardTitle>
        <CardDescription>
          Add a banner image to customize your profile page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div
            {...getRootProps()}
            className={`relative flex h-32 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-sm ${
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25"
            }`}
          >
            <input {...getInputProps()} />
            {isUploading ? (
              <div className="flex flex-col items-center justify-center">
                <Loader2 className="mb-2 size-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </div>
            ) : preview ? (
              <div className="relative h-full w-full">
                <img
                  src={preview}
                  alt="Banner preview"
                  className="h-full w-full rounded-md object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/40 hover:opacity-100">
                  <p className="text-sm font-medium text-white">
                    Click or drag to replace
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center">
                <ImageIcon className="mb-2 size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click or drag and drop to upload
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Recommended size: 1500 x 500px (4MB max)
                </p>
              </div>
            )}
          </div>
          {preview && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemoveBanner}
              disabled={isUploading}
            >
              Remove banner image
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
