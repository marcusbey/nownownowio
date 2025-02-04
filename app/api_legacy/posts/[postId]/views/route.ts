import { authOptions } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth/helper";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    const postId = params.postId;
    const clientIp = req.headers.get("x-forwarded-for") || "unknown";

    // Get or create view record
    await prisma.postView.upsert({
      where: {
        postId_viewerId_clientIp: {
          postId,
          viewerId: userId || "anonymous",
          clientIp,
        },
      },
      create: {
        postId,
        viewerId: userId || "anonymous",
        clientIp,
        viewedAt: new Date(),
      },
      update: {
        viewedAt: new Date(), // Update the timestamp on repeat views
      },
    });

    // Get the total view count for this post
    const viewCount = await prisma.postView.count({
      where: {
        postId,
      },
    });

    return NextResponse.json({ viewCount });
  } catch (error) {
    console.error("Error tracking view:", error);
    return NextResponse.json(
      { error: "Failed to track view" },
      { status: 500 }
    );
  }
}
