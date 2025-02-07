import { prisma } from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { createApiHandler } from "@/lib/api/apiHandler";
import { withPagination } from "@/lib/api/middleware";

export const dynamic = 'force-dynamic';

export const GET = createApiHandler(
  async ({ user, middlewareData }) => {
    const { cursor, pageSize } = middlewareData.pagination;

    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: { followerId: user.id }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: getPostDataInclude(user.id)
    });

    const hasMore = posts.length > pageSize;
    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor: hasMore ? posts[pageSize].id : null
    };

    return { data, status: 200 };
  },
  withPagination(10)
);
