import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import UserAvatar from "@/components/UserAvatar";
import UserTooltip from "@/components/UserTooltip";
import FollowButton from "@/components/FollowButton";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import { Layout, LayoutContent, LayoutHeader, LayoutTitle } from "../page/layout";

export default function PeopleExplore() {
  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>People to Follow</LayoutTitle>
      </LayoutHeader>
      <LayoutContent>
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
            </div>
          }
        >
          <PeopleList />
        </Suspense>
      </LayoutContent>
    </Layout>
  );
}

async function PeopleList() {
  const { user } = await validateRequest();

  if (!user) {
    return (
      <div className="text-center text-muted-foreground py-8">
        Please sign in to see people you might want to follow
      </div>
    );
  }

  const usersToFollow = await prisma.user.findMany({
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
    take: 50,
    orderBy: {
      followers: {
        _count: "desc",
      },
    },
  });

  if (usersToFollow.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No more people to follow at the moment
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {usersToFollow.map((user) => (
        <div
          key={user.id}
          className="flex items-center justify-between p-4 rounded-xl bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/20 
            shadow-sm ring-1 ring-primary/5 hover:bg-card/40 transition-colors"
        >
          <div className="flex items-center gap-4">
            <UserTooltip user={user}>
              <UserAvatar avatarUrl={user.image} className="h-12 w-12" />
            </UserTooltip>
            <div className="flex flex-col">
              <Link
                href={`/users/${user.name}`}
                className="font-medium hover:text-primary transition-colors line-clamp-1"
              >
                {user.name}
              </Link>
              <span className="text-sm text-muted-foreground">{user.displayName}</span>
              {user.bio && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {user.bio}
                </p>
              )}
            </div>
          </div>
          <FollowButton 
            userId={user.id} 
            initialState={{ 
              followers: user._count.followers,
              isFollowedByUser: user.followers.length > 0 
            }} 
          />
        </div>
      ))}
    </div>
  );
}
