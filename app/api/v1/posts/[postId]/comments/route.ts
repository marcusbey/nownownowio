import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import type { CommentsPage } from "@/lib/types";
import { getCommentDataInclude } from "@/lib/types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;

    const pageSize = 10; // Increased from 5 to show more comments initially

    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: getCommentDataInclude(user.id),
      orderBy: { createdAt: "asc" },
      take: pageSize + 1,
      cursor: cursor ? { id: cursor } : undefined,
    });

    const hasMore = comments.length > pageSize;
    const data: CommentsPage = {
      comments: hasMore ? comments.slice(0, pageSize) : comments,
      previousCursor: hasMore ? comments[pageSize].id : null,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> },
) {
  const { postId } = await params;
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content } = await req.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "Comment content is required" },
        { status: 400 }
      );
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: user.id,
        postId,
      },
      include: getCommentDataInclude(user.id),
    });

    // Get post owner to create notification
    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { userId: true }
    });

    // Create notification for post owner (if not the same as commenter)
    if (post && post.userId !== user.id) {
      await prisma.notification.create({
        data: {
          type: "COMMENT",
          issuerId: user.id,
          recipientId: post.userId,
          postId,
        }
      });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
