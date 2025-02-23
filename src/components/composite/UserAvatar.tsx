import { cn } from "@/lib/utils";
import Image from "next/image";

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
  return (
    <Image
      src={avatarUrl ?? "/images/avatar-placeholder.png"}
      alt="User avatar"
      width={size}
      height={size}
      className={cn(
        "aspect-square h-fit flex-none rounded-full bg-secondary object-cover",
        className
      )}
    />
  );
}
