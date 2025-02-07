import { prisma } from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { createApiHandler } from "@/lib/api/apiHandler";
import { withPagination } from "@/lib/api/middleware";

export const dynamic = 'force-dynamic';

export const GET = createApiHandler(
  async ({ user, middlewareData }) => {
    const { cursor, pageSize } = middlewareData.pagination;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: user.id },
      include: {
        post: {
          include: getPostDataInclude(user.id),
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasMore = bookmarks.length > pageSize;
    const data: PostsPage = {
      posts: bookmarks.slice(0, pageSize).map((bookmark) => bookmark.post),
      nextCursor: hasMore ? bookmarks[pageSize].id : null,
    };

    return { data, status: 200 };
  },
  withPagination(10)
);
