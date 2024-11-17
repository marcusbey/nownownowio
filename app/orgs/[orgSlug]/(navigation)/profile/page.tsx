import { validateRequest } from "@/lib/auth/helper";
import FollowButton from "@/components/FollowButton";
import FollowerCount from "@/components/FollowerCount";
import Linkify from "@/components/Linkify";
import UserAvatar from "@/components/UserAvatar";
import { prisma } from "@/lib/prisma";
import { FollowerInfo, getUserDataSelect, UserData } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { format } from "date-fns";
import { Metadata } from "next";
// import { notFound } from "next/navigation";
import { cache } from "react";
import EditProfileButton from "./EditProfileButton";
import UserPosts from "./UserPosts";
import { getCurrentOrgCache } from "@/lib/react/cache";

interface PageProps {
  params: { orgSlug: string };
}

const getUser = cache(async (orgSlug: string, loggedInUserId: string) => {
  const org = await getCurrentOrgCache(orgSlug);
  if (!org) return null;

  // Get the user directly since we already validated organization access through getCurrentOrgCache
  const user = await prisma.user.findUnique({
    where: {
      id: loggedInUserId,
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) return null;
  return user;
});

export async function generateMetadata({
  params: { orgSlug },
}: PageProps): Promise<Metadata> {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const user = await getUser(orgSlug, loggedInUser.id);
  if (!user) return {};

  return {
    title: `${user.displayName} (@${user.name})`,
  };
}

export default async function Page({ params: { orgSlug } }: PageProps) {
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <p className="text-destructive">
        You&apos;re not authorized to view this page.
      </p>
    );
  }

  const user = await getUser(orgSlug, loggedInUser.id);
  
  if (!user) {
    return (
      <p className="text-destructive">
        You are not a member of this organization.
      </p>
    );
  }

  return (
    <main className="flex w-full min-w-0 gap-5">
      <div className="w-full min-w-0 space-y-5">
        <UserProfile user={user} loggedInUserId={loggedInUser.id} />
        <div className="rounded-2xl bg-card p-5 shadow-sm">
          <h2 className="text-center text-2xl font-bold">
            {user.displayName || user.name}&apos;s posts
          </h2>
        </div>
        <UserPosts userId={user.id} />
      </div>
    </main>
  );
}

interface UserProfileProps {
  user: UserData;
  loggedInUserId: string;
}

function UserProfile({ user, loggedInUserId }: UserProfileProps) {
  const followerInfo: FollowerInfo = {
    followers: user._count.followers,
    isFollowedByUser: user.followers.some(
      ({ followerId }) => followerId === loggedInUserId,
    ),
  };

  return (
    <div className="h-fit w-full space-y-5 rounded-2xl bg-card p-5 shadow-sm">
      <UserAvatar
        avatarUrl={user.image}
        size={250}
        className="mx-auto size-full max-h-60 max-w-60 rounded-full"
      />
      <div className="flex flex-wrap gap-3 sm:flex-nowrap">
        <div className="me-auto space-y-3">
          <div>
            <h1 className="text-3xl font-bold">{user.displayName}</h1>
            <div className="text-muted-foreground">@{user.name}</div>
          </div>
          <div>Member since {format(user.createdAt, "MMM d, yyyy")}</div>
          <div className="flex items-center gap-3">
            <span>
              Posts:{" "}
              <span className="font-semibold">
                {formatNumber(user._count.posts)}
              </span>
            </span>
            <FollowerCount userId={user.id} initialState={followerInfo} />
          </div>
        </div>
        {user.id === loggedInUserId ? (
          <EditProfileButton user={user} />
        ) : (
          <FollowButton userId={user.id} initialState={followerInfo} />
        )}
      </div>
      {user.bio && (
        <>
          <hr />
          <Linkify>
            <div className="overflow-hidden whitespace-pre-line break-words">
              {user.bio}
            </div>
          </Linkify>
        </>
      )}
    </div>
  );
}
