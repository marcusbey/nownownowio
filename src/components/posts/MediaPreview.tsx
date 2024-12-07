import { Media } from "@prisma/client";
import Image from "next/image";

export interface MediaPreviewProps {
  media: Media;
}

export default function MediaPreview({ media }: MediaPreviewProps) {
  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
      <Image
        src={media.url}
        alt={media.alt || ""}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}

export interface MediaPreviewsProps {
  attachments: Media[];
}

export function MediaPreviews({ attachments }: MediaPreviewsProps) {
  const gridClassName = attachments.length === 1
    ? ""
    : attachments.length === 2
    ? "grid grid-cols-2 gap-1"
    : attachments.length === 3
    ? "grid grid-cols-2 gap-1"
    : "grid grid-cols-2 gap-1";

  return (
    <div className={gridClassName}>
      {attachments.slice(0, 4).map((media) => (
        <MediaPreview key={media.id} media={media} />
      ))}
    </div>
  );
}
