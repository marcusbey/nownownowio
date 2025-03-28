import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// Set this route to be dynamic to avoid caching issues
export const dynamic = 'force-dynamic';

// Example data route for trending topics
export async function GET() {
  try {
    // First validate that the user is authenticated
    const { user } = await validateRequest();

    if (!user) {
      console.log("Trending topics: Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Trending topics: Fetching data for user", user.id);

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

    console.log("Trending topics: Successfully fetched topics", trendingTopics.length);
    return NextResponse.json(trendingTopics);
  } catch (error) {
    console.error("Trending topics: Error fetching data", error);
    return NextResponse.json({ error: "Failed to fetch trending topics" }, { status: 500 });
  }
} 