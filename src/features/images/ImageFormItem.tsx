import { cn } from "@/lib/utils";
import { UploadButton } from "@/lib/uploadthing";
import Image from "next/image";
import { useState } from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Control } from "react-hook-form";

interface ImageFormItemProps {
  name: string;
  label: string;
  control: Control<any>;
  currentImageUrl?: string | null;
  className?: string;
}

export default function ImageFormItem({
  name,
  label,
  control,
  currentImageUrl,
  className,
}: ImageFormItemProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl ?? null);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-3", className)}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex flex-col items-center gap-4">
              {previewUrl && (
                <div className="relative h-32 w-32 overflow-hidden rounded-full">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <UploadButton
                endpoint="imageUploader"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) {
                    field.onChange(res[0].url);
                    setPreviewUrl(res[0].url);
                  }
                }}
                onUploadError={(error: Error) => {
                  console.error("Upload error:", error);
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
