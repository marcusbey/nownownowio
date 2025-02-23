import { cn } from "@/lib/utils";
import Image from "next/image";

type UserAvatarProps = {
  avatarUrl?: string | null;
} & React.HTMLAttributes<HTMLDivElement>;

export function UserAvatar({
  avatarUrl,
  className,
  ...props
}: UserAvatarProps) {
  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden rounded-full bg-muted",
        className,
      )}
      {...props}
    >
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt="User avatar"
          className="object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-secondary">
          <svg
            className="size-6 text-muted-foreground"
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
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
}
