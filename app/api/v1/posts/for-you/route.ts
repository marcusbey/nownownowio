import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Balance between freshness and performance
// Using force-dynamic ensures we always get fresh data
// But we'll add client-side caching through Cache-Control headers
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: Promise<Record<string, string>> }) {
  // Properly await params in Next.js 15, even though we're not using any params in this route
  await params;
  // --- ENHANCED CACHING STRATEGY ---
  // Define cache headers for more aggressive caching
  const headers = {
    'Cache-Control': 'public, max-age=30, stale-while-revalidate=120', // Cache for 30s, revalidate for 2 mins
    'CDN-Cache-Control': 'public, s-maxage=60', // CDN cache for 1 min
    'Vercel-CDN-Cache-Control': 'public, s-maxage=60' // Vercel specific
  };

  try {
    const cursor = req.nextUrl.searchParams.get("cursor") ?? undefined;
    // Topic filtering is not implemented yet
    const _topic = req.nextUrl.searchParams.get("topic");
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
              displayName: true,
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
          media: true, // Include media in the query
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
      // We know nextItem exists since we checked posts.length > pageSize
      nextCursor = nextItem?.id ?? undefined;
    }

    return NextResponse.json({
      posts,
      nextCursor,
    }, { headers });
  } catch (error) {
    // Log error to server logs only in development
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.error("[GET /api/v1/posts/for-you]", error);
    }
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500, headers }
    );
  }
}
