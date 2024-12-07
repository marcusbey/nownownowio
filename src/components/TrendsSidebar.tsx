import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { formatNumber } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";
import FollowButton from "./FollowButton";
import SearchField from "./SearchField";
import UserAvatar from "./UserAvatar";
import UserTooltip from "./UserTooltip";

export default function TrendsSidebar() {
  return (
    <div className="sticky top-[5.25rem] h-fit w-full space-y-6">
      {/* Search and Filters Section */}
      <div className="rounded-xl bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/20 
        shadow-sm ring-1 ring-primary/5 p-4 space-y-4">
        <SearchField />
      </div>

      {/* Who to Follow Section */}
      <Suspense 
        fallback={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/50" />
          </div>
        }
      >
        <WhoToFollow />
        <TrendingTopics />
      </Suspense>
    </div>
  );
}

async function WhoToFollow() {
  const { user } = await validateRequest();

  if (!user) return null;

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
    take: 5,
  });

  return (
    <div className="rounded-xl bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/20 
      shadow-sm ring-1 ring-primary/5 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Who to follow</h2>
        <Link 
          href="/explore/people" 
          className="text-sm text-primary/70 hover:text-primary transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {usersToFollow.map((user) => (
          <div key={user.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <UserTooltip user={user}>
                <UserAvatar user={user} className="h-10 w-10" />
              </UserTooltip>
              <div className="flex flex-col">
                <Link 
                  href={`/@${user.username}`}
                  className="font-medium hover:text-primary transition-colors line-clamp-1"
                >
                  {user.name}
                </Link>
                <span className="text-sm text-muted-foreground">@{user.username}</span>
              </div>
            </div>
            <FollowButton userId={user.id} />
          </div>
        ))}
      </div>
    </div>
  );
}

const getTrendingTopics = unstable_cache(
  async () => {
    const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
            SELECT LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'g'))) AS hashtag, COUNT(*) AS count
            FROM posts
            GROUP BY (hashtag)
            ORDER BY count DESC, hashtag ASC
            LIMIT 5
        `;

    return result.map((row) => ({
      hashtag: row.hashtag,
      count: Number(row.count),
    }));
  },
  ["trending_topics"],
  {
    revalidate: 3 * 60 * 60,
  },
);

async function TrendingTopics() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div className="rounded-xl bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/20 
      shadow-sm ring-1 ring-primary/5 p-5 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Trending topics</h2>
        <Link 
          href="/explore/topics" 
          className="text-sm text-primary/70 hover:text-primary transition-colors"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {trendingTopics.map(({ hashtag, count }) => {
          const title = hashtag.split("#")[1];

          return (
            <Link key={title} href={`/hashtag/${title}`} className="block py-3 first:pt-0 last:pb-0">
              <p
                className="line-clamp-1 break-all font-semibold hover:underline"
                title={hashtag}
              >
                {hashtag}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatNumber(count)} {count === 1 ? "post" : "posts"}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
