"use client";

import { FollowerInfo, UserData } from "@/lib/types";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { PropsWithChildren, useMemo, lazy, Suspense } from "react";
import FollowButton from "./FollowButton";
import FollowerCount from "./FollowerCount";
import Linkify from "./Linkify";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import UserAvatar from "./UserAvatar";

interface UserTooltipProps extends PropsWithChildren {
  user: UserData;
}

export default function UserTooltip({ children, user }: UserTooltipProps) {
  const { data: session } = useSession();
  const loggedInUser = session?.user;

  const followerState = useMemo(
    () => ({
      followers: user._count.followers,
      isFollowedByUser: !!user.followers.some(
        ({ followerId }) => followerId === loggedInUser?.id,
      ),
    }),
    [user._count.followers, user.followers, loggedInUser?.id]
  );

  const tooltipContent = useMemo(
    () => (
      <div className="flex max-w-80 flex-col gap-3 break-words px-1 py-2.5 md:min-w-52">
        <div className="flex items-center justify-between gap-2">
          <Link href={`/users/${user.name}`}>
            <UserAvatar size={70} avatarUrl={user.image} />
          </Link>
          {loggedInUser && loggedInUser.id !== user.id && (
            <FollowButton userId={user.id} initialState={followerState} />
          )}
        </div>
        <div>
          <Link href={`/users/${user.name}`}>
            <div className="text-lg font-semibold hover:underline">
              {user.displayName}
            </div>
            <div className="text-muted-foreground">@{user.name}</div>
          </Link>
        </div>
        {user.bio && (
          <Linkify>
            <div className="line-clamp-4 whitespace-pre-line">{user.bio}</div>
          </Linkify>
        )}
        <FollowerCount userId={user.id} initialState={followerState} />
      </div>
    ),
    [user, loggedInUser, followerState]
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent>
          <Suspense fallback={<div>Loading...</div>}>
            {tooltipContent}
          </Suspense>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
