import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { name } }: { params: { name: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
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
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch additional data only if needed
    const [postsCount, commentsCount] = await Promise.all([
      prisma.post.count({ where: { authorId: user?.id } }),
      prisma.comment.count({ where: { authorId: user?.id } }),
    ]);

    return Response.json({
      ...user,
      _count: {
        ...user?._count,
        posts: postsCount,
        comments: commentsCount,
      }
    });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
