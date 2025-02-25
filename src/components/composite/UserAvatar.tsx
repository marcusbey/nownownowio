import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

type UserAvatarProps = {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
};

const PLACEHOLDER_IMAGE = "/images/avatar-placeholder.png";

export default function UserAvatar({
  avatarUrl,
  size = 48,
  className,
}: UserAvatarProps) {
  const [error, setError] = useState(false);

  // Normalize the avatar URL
  const normalizedAvatarUrl = avatarUrl?.startsWith("http") ? avatarUrl : avatarUrl?.startsWith("/") ? avatarUrl : `/${avatarUrl}`;

  // Use placeholder if no URL or error
  const imageUrl = error || !normalizedAvatarUrl ? PLACEHOLDER_IMAGE : normalizedAvatarUrl;

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-full bg-secondary",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageUrl}
        alt="User avatar"
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setError(true)}
        priority={size > 64} // Prioritize loading for larger avatars
      />
    </div>
  );
}
