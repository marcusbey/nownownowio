import { authRoute } from "@/lib/safe-route";
import { prisma } from "@/lib/prisma";
import { queryCache } from "@/lib/cache/query-cache";
import { NextResponse } from "next/server";
import { getUserDataSelect } from "@/lib/types";

export const GET = authRoute.handle(async ({ user }) => {
  const cacheKey = `profile-${user.id}`;

  try {
    // Try to get data from cache first
    const data = await queryCache.query(
      cacheKey,
      async () => {
        // Get all necessary data in parallel
        const [userData, posts, followers, following] = await Promise.all([
          prisma.user.findUnique({
            where: { id: user.id },
            select: {
              ...getUserDataSelect(user.id),
              organizations: {
                select: {
                  organization: {
                    select: {
                      slug: true,
                      name: true,
                      image: true,
                    },
                  },
                },
              },
            },
          }),
          prisma.post.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            take: 10,
            include: {
              user: {
                select: getUserDataSelect(user.id),
              },
              _count: {
                select: {
                  likes: true,
                  comments: true,
                },
              },
              likes: {
                where: { userId: user.id },
                select: { userId: true },
              },
              bookmarks: {
                where: { userId: user.id },
                select: { userId: true },
              },
            },
          }),
          prisma.follow.count({
            where: { followingId: user.id },
          }),
          prisma.follow.count({
            where: { followerId: user.id },
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
        staleTime: 60 * 1000, // Consider data stale after 1 minute
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
});
