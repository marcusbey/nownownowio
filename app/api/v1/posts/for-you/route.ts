import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const headers = {
    'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=59'
  };

  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const topic = req.nextUrl.searchParams.get("topic");
    const pageSize = 10;

    const session = await baseAuth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true } // Only select needed fields
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404, headers });
    }

    // For now, we'll skip the topic filtering since it's not in the schema
    const where: Prisma.PostWhereInput = {};

    const posts = await prisma.$transaction(async (tx) => {
      return tx.post.findMany({
        where,
        select: {  // Only select needed fields
          id: true,
          content: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true,
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
              }
            }
          },
          _count: {
            select: {
              likes: true,
              comments: true
            }
          },
          likes: {
            where: { userId: existingUser.id },
            select: { userId: true }
          },
          bookmarks: {
            where: { userId: existingUser.id },
            select: { userId: true }
          }
        },
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });
    });

    let nextCursor: typeof cursor = undefined;
    if (posts.length > pageSize) {
      const nextItem = posts.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({
      posts,
      nextCursor,
    }, { headers });
  } catch (error) {
    console.error("[GET /api/v1/posts/for-you]", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500, headers }
    );
  }
}
