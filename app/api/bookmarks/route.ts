import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

// GET /api/bookmarks - Get user's bookmarks
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      include: {
        post: {
          include: {
            user: true,
            attachments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookmarks);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookmarks" },
      { status: 500 }
    );
  }
}

// POST /api/bookmarks - Create a bookmark
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { postId } = await request.json();
    if (!postId) {
      return NextResponse.json(
        { error: "Post ID is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const bookmark = await prisma.bookmark.create({
      data: {
        userId: user.id,
        postId,
      },
      include: {
        post: {
          include: {
            user: true,
            attachments: true,
          },
        },
      },
    });

    return NextResponse.json(bookmark);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Post already bookmarked" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create bookmark" },
      { status: 500 }
    );
  }
}
