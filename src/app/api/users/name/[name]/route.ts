import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params: { name } }: { params: { name: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: {
        name: {
          equals: decodeURIComponent(name),
          mode: "insensitive",
        },
        organizations: {
          some: {
            organizationId: {
              not: "",
            },
          },
        },
      },
      select: {
        ...getUserDataSelect(loggedInUser.id),
        organizations: {
          select: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
              }
            },
          },
        },
        _count: {
          select: {
            followers: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch additional data only if needed
    const [postsCount, commentsCount] = await Promise.all([
      prisma.post.count({ where: { userId: user?.id } }),
      prisma.comment.count({ where: { userId: user?.id } }),
    ]);

    return NextResponse.json({
      ...user,
      _count: {
        ...user?._count,
        posts: postsCount,
        comments: commentsCount,
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
