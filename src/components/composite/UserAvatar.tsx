import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";

type UserAvatarProps = {
  avatarUrl: string | null | undefined;
  size?: number;
  className?: string;
};

export default function UserAvatar({
  avatarUrl,
  size = 48,
  className,
}: UserAvatarProps) {
  const [error, setError] = useState(false);

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-full bg-secondary",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={error || !avatarUrl ? "/images/avatar-placeholder.png" : avatarUrl}
        alt="User avatar"
        fill
        sizes={`${size}px`}
        className="object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
