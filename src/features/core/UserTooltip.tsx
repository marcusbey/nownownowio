"use client";

import Linkify from "@/components/data-display/Linkify";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/data-display/tooltip";
import type { UserData } from "@/lib/types";
import { useSession } from "next-auth/react";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import FollowButton from "./FollowButton";
import FollowerCount from "./FollowerCount";
import UserAvatar from "./UserAvatar";

type UserTooltipProps = {
  user: UserData;
} & PropsWithChildren;

export default function UserTooltip({ children, user }: UserTooltipProps) {
  const { data: session } = useSession();
  const loggedInUser = session?.user;

  const followerState = useMemo(
    () => ({
      followers: user._count.followers ?? 0,
      isFollowedByUser:
        user.followers.some(
          ({ followerId }) => followerId === loggedInUser?.id,
        ) ?? false,
    }),
    [user._count.followers, user.followers, loggedInUser?.id],
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
              {user.displayName || user.name}
            </div>
            <div className="text-sm text-muted-foreground">@{user.name}</div>
          </Link>
        </div>
        {user.bio && (
          <Linkify>
            <div className="text-sm">{user.bio}</div>
          </Linkify>
        )}
        <FollowerCount
          userId={user.id}
          initialState={{
            followers: followerState.followers,
            isFollowedByUser: followerState.isFollowedByUser,
          }}
        />
      </div>
    ),
    [user, loggedInUser, followerState],
  );

  if (!user) return <>{children}</>;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side="bottom"
          align="start"
          sideOffset={5}
          className="bg-card"
        >
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
