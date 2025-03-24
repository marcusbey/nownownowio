"use client";

import { Button } from "@/components/core/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { Textarea } from "@/components/core/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { updateUserProfileSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import type { User } from "@prisma/client";
import { Camera, ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

type PersonalAccountFormProps = {
  user: User;
  isEmailVerified: boolean;
};

export function PersonalAccountForm({
  user,
  isEmailVerified,
}: PersonalAccountFormProps) {
  const router = useRouter();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Set initial avatar preview from user data
  useEffect(() => {
    if (user.image) {
      setAvatarPreview(user.image);
    }
  }, [user.image]);

  const form = useForm<z.infer<typeof updateUserProfileSchema>>({
    resolver: zodResolver(updateUserProfileSchema),
    defaultValues: {
      displayName: user.displayName ?? "",
      bio: user.bio ?? "",
      websiteUrl: user.websiteUrl ?? "",
    },
  });

  const onSubmit = async (values: z.infer<typeof updateUserProfileSchema>) => {
    try {
      const response = await fetch("/api/v1/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update profile");
      }

      toast.success("Profile updated successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile",
      );
    }
  };

  const onDropAvatar = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        toast.error("No file selected");
        return;
      }

      const file = acceptedFiles[0];

      if (!(file instanceof File) || !file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please select an image file.");
        return;
      }

      try {
        setIsUploading(true);

        // Create a preview for immediate feedback - use try/catch to handle potential errors
        try {
          const objectUrl = URL.createObjectURL(file);
          setAvatarPreview(objectUrl);
        } catch (previewError) {
          console.error("Error creating preview:", previewError);
          // Continue with upload even if preview fails
        }

        // Create FormData and append the file
        const formData = new FormData();
        formData.append("file", file);

        // Use our dedicated endpoint for avatar uploads
        const response = await fetch("/api/v1/user/avatarUpload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to upload profile image");
        }

        const { url } = await response.json();

        // No need to update form - the API already updates the database
        toast.success("Profile image updated successfully");

        // Refresh the page to show updated data
        router.refresh();
      } catch (error) {
        toast.error("Failed to upload profile image");
        console.error(error);
        setAvatarPreview(user.image ?? null);
      } finally {
        setIsUploading(false);
      }
    },
    [user.image, router],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropAvatar,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 512 * 1024, // 512KB
  });

  const handleRemoveAvatar = async () => {
    try {
      setIsUploading(true);
      setAvatarPreview(null);

      const response = await fetch("/api/v1/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to remove profile image");
      }

      toast.success("Profile image removed");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove profile image");
      setAvatarPreview(user.image ?? null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Account</CardTitle>
        <CardDescription>Update your personal account details</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium">Profile Photo</h3>
          <div className="flex items-start gap-4">
            <div
              {...getRootProps()}
              className={`relative size-24 overflow-hidden rounded-full ${
                isDragActive
                  ? "border-2 border-dashed border-primary bg-primary/5"
                  : "border border-muted"
              }`}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="flex size-full flex-col items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              ) : avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full flex-col items-center justify-center bg-muted/20">
                  <ImageIcon className="size-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all hover:bg-black/50 hover:opacity-100">
                <Camera className="size-6 text-white" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Upload a photo to personalize your account.
              </p>
              <p className="text-xs text-muted-foreground/70">
                Maximum file size: 512KB
              </p>
              {avatarPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveAvatar}
                  disabled={isUploading}
                >
                  <X className="mr-1 size-4" />
                  Remove photo
                </Button>
              )}
            </div>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email field (read-only) */}
          <div className="space-y-1">
            <label className="text-sm font-medium">Email</label>
            <div className="flex items-center gap-2">
              <Input value={user.email} disabled className="bg-muted" />
              <div className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                {isEmailVerified ? "Verified" : "Pending"}
              </div>
            </div>
          </div>

          {/* Display Name */}
          <FormField
            control={form.control}
            name="displayName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your display name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us a little bit about yourself"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Website URL */}
          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    placeholder="https://example.com"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
