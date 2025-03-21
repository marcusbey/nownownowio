import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Example data route for trending topics
export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
  // Properly await params in Next.js 15, even though we're not using any params in this route
  await params;
    try {
        // Sample query: you can adapt for your own logic
        const result = await prisma.$queryRaw<{ hashtag: string; count: bigint }[]>`
      SELECT
        LOWER(unnest(regexp_matches(content, '#[[:alnum:]_]+', 'gi'))) AS hashtag,
        COUNT(*) AS count
      FROM posts
      GROUP BY hashtag
      ORDER BY count DESC, hashtag ASC
      LIMIT 5
    `;

        const trendingTopics = result.map((row) => ({
            id: row.hashtag, // or any unique key
            label: row.hashtag,
            count: Number(row.count),
        }));

        return NextResponse.json(trendingTopics);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch trending topics" }, { status: 500 });
    }
} 