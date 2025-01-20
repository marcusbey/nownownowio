import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";

export async function getUsersOrgs() {
  const session = await auth();

  if (!session?.user) {
    return [];
  }

  return await prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId: session.user.id,
        },
      },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      image: true,
      members: {
        select: {
          roles: true,
        },
        where: {
          userId: session.user.id,
        },
      },
    },
  });
}
