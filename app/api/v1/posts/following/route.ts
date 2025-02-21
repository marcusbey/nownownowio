import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { PostsPage } from "@/lib/types";
import type { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const pageSize = 10;

    const session = await baseAuth();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const posts = await prisma.post.findMany({
      where: {
        user: {
          followers: {
            some: {
              followerId: session.user.id,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
      include: {
        user: {
          select: {
            memberships: {
              select: {
                organization: {
                  select: {
                    slug: true,
                    name: true,
                  },
                },
                roles: true,
              },
            },
          },
        },
      },
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in following posts:', errorMessage);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
