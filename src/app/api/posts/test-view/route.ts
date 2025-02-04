import { prisma as db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // First, ensure we have a test user
    let testUser = await db.user.findFirst({
      where: {
        email: "test@example.com",
      },
    });

    if (!testUser) {
      testUser = await db.user.create({
        data: {
          id: crypto.randomUUID().slice(0, 11),
          email: "test@example.com",
          name: "Test User",
        },
      });
    }

    // Then, ensure we have a test post
    let post = await db.post.findFirst({
      where: {
        content: "Test post for view tracking",
        userId: testUser.id,
      },
    });

    if (!post) {
      post = await db.post.create({
        data: {
          id: crypto.randomUUID().slice(0, 11),
          content: "Test post for view tracking",
          userId: testUser.id,
        },
      });
    }

    const viewerId = testUser.id;
    const clientIp = "127.0.0.1";

    // Try to upsert a view record with the actual post ID
    const view = await db.postView.upsert({
      where: {
        postId_viewerId_clientIp: {
          postId: post.id,
          viewerId,
          clientIp,
        },
      },
      create: {
        id: crypto.randomUUID().slice(0, 11),
        postId: post.id,
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
      where: { postId: post.id },
    });

    return NextResponse.json({
      success: true,
      post,
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
