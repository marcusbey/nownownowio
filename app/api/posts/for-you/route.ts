import { NextResponse } from "next/server";
import { baseAuth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { getPostDataInclude } from "@/lib/types";
import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    const topic = req.nextUrl.searchParams.get("topic");
    const pageSize = 10;

    const session = await baseAuth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For now, we'll skip the topic filtering since it's not in the schema
    const where: Prisma.PostWhereInput = {};

    const posts = await prisma.$transaction(async (tx) => {
      return tx.post.findMany({
        where,
        include: getPostDataInclude(existingUser.id),
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
    });
  } catch (error) {
    console.error("[GET /api/posts/for-you]", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}
