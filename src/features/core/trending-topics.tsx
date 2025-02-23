import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import { unstable_cache } from "next/cache";
import Link from "next/link";

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

export async function TrendingTopicsSection() {
  const trendingTopics = await getTrendingTopics();

  return (
    <div
      className="space-y-5 rounded-xl bg-card/30 p-5 
      shadow-sm ring-1 ring-primary/5 backdrop-blur supports-[backdrop-filter]:bg-card/20"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Trending topics</h2>
        <Link
          href="/explore/topics"
          className="text-sm text-primary/70 transition-colors hover:text-primary"
        >
          View all
        </Link>
      </div>
      <div className="divide-y divide-border/50">
        {trendingTopics.map(({ hashtag, count }) => {
          const title = hashtag.split("#")[1];

          return (
            <Link
              key={title}
              href={`/hashtag/${title}`}
              className="block py-3 first:pt-0 last:pb-0"
            >
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
