import { prisma as db } from "@/lib/prisma";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Get all PostView records
    const views = await db.postView.findMany({
      include: {
        post: {
          select: {
            id: true
          }
        }
      }
    });

    return NextResponse.json({
      totalViews: views.length,
      views: views.map(v => ({
        id: v.id,
        postId: v.postId,
        viewerId: v.viewerId,
        clientIp: v.clientIp,
        viewedAt: v.viewedAt
      }))
    });
  } catch (error) {
    console.error("Error checking views:", error);
    return NextResponse.json(
      {
        error: "Failed to check views",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
