import { prisma } from "@/lib/prisma";
import { createApiHandler, requireOwnership } from "@/lib/api/apiHandler";

export const DELETE = createApiHandler(
  async ({ params }) => {
    await prisma.comment.delete({
      where: { id: params!.commentId },
    });

    return { data: { success: true }, status: 200 };
  },
  requireOwnership('comment', 'commentId')
);
