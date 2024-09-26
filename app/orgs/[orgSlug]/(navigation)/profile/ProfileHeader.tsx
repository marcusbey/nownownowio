"use client";

import { buttonVariants } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import { User } from "@prisma/client";
import Link from "next/link";

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="flex items-center space-x-4 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar avatarUrl={user.image} size={80} />
      <div className="flex-1">
        <h1 className="text-2xl font-bold">
          {user.displayName ? user.displayName : user.name}
        </h1>
        <p className="text-muted-foreground">@{user.name}</p>
        {user.bio && <p className="mt-2">{user.bio}</p>}
      </div>
      <Link href="/account/settings">
        <button className={buttonVariants({ variant: "default" })}>
          Edit Profile
        </button>
      </Link>
    </div>
  );
}
