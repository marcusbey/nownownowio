import { authRoute } from "@/lib/safe-route";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { queryCache } from "@/lib/cache/query-cache";
import { getUserDataSelect } from "@/lib/types";
import { auth } from "@/lib/auth/helper";

export async function GET(req: NextRequest) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = user.id;
    const cacheKey = `profile-${userId}`;

    const data = await queryCache.query(
      cacheKey,
      async () => {
        // Get all necessary data in parallel
        const [userData, posts, followers, following] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: {
              ...getUserDataSelect(userId),
              organizations: {
                select: {
                  organization: {
                    select: {
                      id: true,
                      name: true,
                      slug: true,
                      image: true,
                    },
                  },
                },
              },
            },
          }),
          prisma.post.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              user: {
                select: getUserDataSelect(userId),
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
              likes: {
                where: { userId },
                select: { userId: true },
              },
              bookmarks: {
                where: { userId },
                select: { userId: true },
              },
            },
          }),
          prisma.follow.count({
            where: { followingId: userId },
          }),
          prisma.follow.count({
            where: { followerId: userId },
          }),
        ]);

        return {
          user: userData,
          posts,
          stats: {
            followers,
            following,
            posts: posts.length,
          },
        };
      },
      {
        ttl: 5 * 60 * 1000, // Cache for 5 minutes
      }
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile data" },
      { status: 500 }
    );
  }
}
