import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getPostDataInclude, PostsPage } from "@/lib/types";
import { NextRequest } from "next/server";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const topic = req.nextUrl.searchParams.get("topic");

    const pageSize = 10;

    // Add retry logic for auth
    let user;
    let authAttempts = 0;
    const maxAuthAttempts = 3;
    
    while (!user && authAttempts < maxAuthAttempts) {
      try {
        const auth = await validateRequest();
        user = auth.user;
      } catch (error) {
        authAttempts++;
        if (authAttempts === maxAuthAttempts) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000 * authAttempts));
      }
    }

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where = topic && topic !== 'all' ? {
      topics: {
        some: {
          name: topic
        }
      }
    } : undefined;

    const posts = await prisma.$transaction(async (tx) => {
      return tx.post.findMany({
        where,
        include: getPostDataInclude(user.id),
        orderBy: { createdAt: "desc" },
        take: pageSize + 1,
        cursor: cursor ? { id: cursor } : undefined,
      });
    }, {
      timeout: 20000,  // Increased to 20 seconds for cold starts
      maxWait: 30000,  // Increased to 30 seconds max wait
    });

    const nextCursor = posts.length > pageSize ? posts[pageSize].id : null;

    const data: PostsPage = {
      posts: posts.slice(0, pageSize),
      nextCursor,
    };

    return Response.json(data);
  } catch (error) {
    console.error('Error in /api/posts/for-you:', error);
    if (error instanceof Error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
