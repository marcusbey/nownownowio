"use client";

import { Button } from "@/components/core/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/data-display/avatar";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

type PostInputProps = {
  userImage?: string | null;
  userName?: string | null;
  className?: string;
};

export function PostInput({ userImage, userName, className }: PostInputProps) {
  const router = useRouter();

  return (
    <div className={cn("flex items-center gap-4 p-4", className)}>
      <Avatar>
        <AvatarImage src={userImage ?? undefined} alt={userName ?? "User"} />
        <AvatarFallback>{userName?.[0] ?? "U"}</AvatarFallback>
      </Avatar>
      <Button
        variant="outline"
        className="h-auto w-full justify-start rounded-full py-2 text-left text-muted-foreground"
        onClick={() => router.push("/compose")}
      >
        What&apos;s on your mind?
      </Button>
    </div>
  );
}
