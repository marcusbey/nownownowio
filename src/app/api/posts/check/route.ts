import { prisma as db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const posts = await db.post.findMany({
      select: {
        id: true,
        _count: {
          select: {
            views: true
          }
        }
      }
    });

    return NextResponse.json({
      totalPosts: posts.length,
      posts: posts.map(p => ({
        id: p.id,
        viewCount: p._count.views
      }))
    });
  } catch (error) {
    console.error("Error checking posts:", error);
    return NextResponse.json(
      { 
        error: "Failed to check posts",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
