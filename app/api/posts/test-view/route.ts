import { prisma as db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // Test with a known post ID
    const postId = "h048j23oAJe";
    const viewerId = "anonymous";
    const clientIp = "test-ip";

    // Try to upsert a view record
    const view = await db.postView.upsert({
      where: {
        postId_viewerId_clientIp: {
          postId,
          viewerId,
          clientIp,
        },
      },
      create: {
        id: crypto.randomUUID().slice(0, 11),
        postId,
        viewerId,
        clientIp,
        viewedAt: new Date(),
      },
      update: {
        viewedAt: new Date(),
      },
    });

    // Get the view count
    const viewCount = await db.postView.count({
      where: { postId },
    });

    return NextResponse.json({
      success: true,
      view,
      viewCount,
    });
  } catch (error) {
    console.error("Error in test view:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        type: error instanceof Error ? error.constructor.name : typeof error,
      },
      { status: 500 }
    );
  }
}
