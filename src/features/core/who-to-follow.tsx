import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import Link from "next/link";
import FollowButton from "./FollowButton";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";

async function getWhoToFollow() {
  const { user } = await validateRequest();

  if (!user) return [];

  return prisma.user.findMany({
    where: {
      NOT: {
        id: user.id,
      },
      followers: {
        none: {
          followerId: user.id,
        },
      },
    },
    select: getUserDataSelect(user.id),
    take: 5,
  });
}

export async function WhoToFollowSection() {
  const usersToFollow = await getWhoToFollow();

  return (
    <div
      className="space-y-5 rounded-xl bg-card/30 p-5 
      shadow-sm ring-1 ring-primary/5 backdrop-blur supports-[backdrop-filter]:bg-card/20"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Who to follow</h2>
        <Link
          href="/explore/people"
          className="text-sm text-primary/70 transition-colors hover:text-primary"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {usersToFollow.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <UserTooltip user={user}>
                <UserAvatar avatarUrl={user.image} className="size-10" />
              </UserTooltip>
              <div className="flex flex-col">
                <Link
                  href={`/users/${user.name}`}
                  className="line-clamp-1 font-medium transition-colors hover:text-primary"
                >
                  {user.name}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {user.displayName}
                </span>
              </div>
            </div>
            <FollowButton
              userId={user.id}
              initialState={{
                followers: user._count.followers,
                isFollowedByUser: user.followers.length > 0,
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
