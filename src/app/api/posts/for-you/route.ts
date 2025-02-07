import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getPostDataInclude } from "@/lib/types";
import { createApiHandler } from "@/lib/api/apiHandler";
import { withPagination } from "@/lib/api/middleware";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 60;

const headers = {
  'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59'
};

export const GET = createApiHandler(
  async ({ user, middlewareData, req }) => {
    try {
      const { cursor, pageSize } = middlewareData.pagination;
      const topic = req.nextUrl.searchParams.get("topic");

      // For now, we'll skip the topic filtering since it's not in the schema
      const where: Prisma.PostWhereInput = {};

      const posts = await prisma.$transaction(async (tx) => {
      return tx.post.findMany({
        where,
        select: {
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          },
          likes: {
            where: { userId: user.id },
            select: { userId: true }
          },
          bookmarks: {
            where: { userId: user.id },
            select: { userId: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });

    const hasMore = posts.length > pageSize;
    if (hasMore) {
      posts.pop();
    }

    return { 
      data: {
        posts,
        nextCursor: hasMore ? posts[posts.length - 1].id : null
      },
      status: 200,
      headers
    };
  } catch (error) {
    console.error("[GET /api/posts/for-you]", error);
    throw error;
  }
  },
  withPagination(10)
);
