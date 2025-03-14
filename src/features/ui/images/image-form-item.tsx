import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/composite/dialog";
import { Input } from "@/components/core/input";
import { Loader } from "@/components/feedback/loader";
import { Typography } from "@/components/data-display/typography";
import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { cn } from "@/lib/utils";
import { SiteConfig } from "@/site-config";
import { useMutation } from "@tanstack/react-query";
import type { PropsWithChildren} from "react";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "../form/submit-button";
import { NativeTargetBox } from "./native-target-box";
import { uploadImageAction } from "./upload-image.action";

type ImageFormItemProps = {
  onChange: (url: string) => void;
  imageUrl?: string | null;
  className?: string;
};

export const ImageFormItem = ({
  onChange,
  imageUrl,
  className,
}: ImageFormItemProps) => {
  const currentImage = imageUrl;

  return (
    <div
      className={cn(
        "border relative overflow-hidden bg-muted rounded-md aspect-square h-32 group",
        className,
      )}
    >
      {currentImage ? (
        <img
          src={currentImage}
          className="absolute inset-0 size-full object-cover"
          alt="Organization logo"
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
      {SiteConfig.features.enableImageUpload ? (
        <UseImageUpload onChange={onChange} />
      ) : (
        <UseImageButton
          onChange={(params) => {
            onChange(params.url);
          }}
        />
      )}
    </div>
  );
};

const Overlay = (props: PropsWithChildren<{ isLoading?: boolean }>) => {
  return (
    <div
      className={cn(
        "absolute inset-0 opacity-0 transition-opacity flex items-center justify-center",
        {
          "group-hover:bg-background/70 group-hover:opacity-100":
            !props.isLoading,
          "bg-background/70 opacity-100": props.isLoading,
        },
      )}
    >
      {props.children}
    </div>
  );
};

const UseImageUpload = ({ onChange }: { onChange: (url: string) => void }) => {
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.set("name", file.name);
      formData.set("file", file);

      const result = await uploadImageAction({
        formData,
      });

      if (!isActionSuccessful(result)) {
        toast.error(result?.serverError ?? "Something went wrong");
        return;
      }

      onChange(result.data.url);
    },
  });

  const handleDrop = async (item: { files: File[] }) => {
    const file = item.files[0] as File;

    const validFiles = ["image/png", "image/jpeg", "image/jpg"];

    if (!validFiles.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Only png, jpg, jpeg are allowed",
      });
      return;
    }

    if (file.size > 1024 * 1024) {
      toast.error("File too large (max 1mb)", {
        description: "https://tinypng.com/ to compress the image",
      });
      return;
    }

    uploadImageMutation.mutate(file);
  };

  return (
    <Overlay isLoading={uploadImageMutation.isPending}>
      <NativeTargetBox
        className="absolute inset-0 flex h-auto items-center justify-center"
        isLoading={uploadImageMutation.isPending}
        onDrop={handleDrop}
        accept={["*.png"]}
      >
        {uploadImageMutation.isPending ? (
          <Loader />
        ) : (
          <Typography variant="muted">Upload</Typography>
        )}
      </NativeTargetBox>
    </Overlay>
  );
};

const UseImageButton = ({
  onChange,
}: {
  onChange: (params: { url: string }) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const mutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Invalid URL");
      }

      const responseBlob = await response.blob();

      if (!responseBlob.type.startsWith("image")) {
        throw new Error("Invalid URL");
      }

      return url;
    },
    onSuccess: (url) => {
      onChange({ url });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Overlay>
        <DialogTrigger>
          <Typography as="span" variant="small" className="text-xs">
            Change
          </Typography>
        </DialogTrigger>
      </Overlay>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use an image URL</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Input
            type="url"
            onChange={(e) => setImageUrl(e.target.value)}
            value={imageUrl}
          />
          <LoadingButton
            loading={mutation.isPending}
            type="button"
            onClick={() => {
              mutation.mutate(imageUrl);
            }}
            variant="secondary"
            size="sm"
          >
            Save
          </LoadingButton>
        </div>
      </DialogContent>
    </Dialog>
  );
};
