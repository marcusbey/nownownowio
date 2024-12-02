import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect, UserData } from "@/lib/types";

export async function GET(
  req: Request,
  { params: { name } }: { params: { name: string } },
) {
  try {
    const { user: loggedInUser } = await validateRequest();

    if (!loggedInUser) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user: UserData | null = await prisma.user.findFirst({
      where: {
        name: {
          equals: decodeURIComponent(name),
          mode: "insensitive",
        },
        organizations: {
          some: {
            organization: {
              id: {
                not: null,
              },
            },
          },
        },
      },
      select: {
        ...getUserDataSelect(loggedInUser.id),
        organizations: true,
        posts: true,
        comments: true,
        likes: true,
      },
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
