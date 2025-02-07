import { prisma } from "@/lib/prisma";
import { createApiHandler, requireOwnership } from "@/lib/api/apiHandler";

export const DELETE = createApiHandler(
  async ({ params }) => {
    await prisma.bookmark.delete({
      where: { id: params!.id },
    });

    return { data: { success: true }, status: 200 };
  },
  requireOwnership('bookmark', 'id')
);
