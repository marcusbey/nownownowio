import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/api/apiHandler";
import { withIpTracking } from "@/lib/api/middleware";

async function getViewCount(postId: string) {
  try {
    return await prisma.postView.count({ where: { postId } });
  } catch (error) {
    console.error("Error getting view count:", error);
    return 0;
  }
}

async function trackView(postId: string, viewerId: string, clientIp: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true }
  });

  if (!post) {
    throw new Error(`Post ${postId} not found`);
  }

  await prisma.postView.upsert({
    where: {
      postId_viewerId_clientIp: {
        postId,
        viewerId,
        clientIp,
      },
    },
      update: {
        viewedAt: new Date(),
      },
      create: {
        postId,
        viewerId,
        clientIp,
      },
  });
}

export const GET = createApiHandler(async ({ params }) => {
  try {
    if (!params?.postId) {
      return { error: "Post ID is required", status: 400 };
    }
    const count = await getViewCount(params.postId);
    return { data: { viewCount: count }, status: 200 };
  } catch (error) {
    console.error("[GET /api/posts/[postId]/views]", error);
    throw error;
  }
});

export const POST = createApiHandler(
  async ({ user, params, middlewareData }) => {
    try {
      if (!params?.postId) {
        return { error: "Post ID is required", status: 400 };
      }

      const { clientIp } = middlewareData.ipTracking;
      
      await trackView(params.postId, user.id, clientIp);
      const count = await getViewCount(params.postId);

      return { data: { viewCount: count }, status: 200 };
    } catch (error) {
      console.error("[POST /api/posts/[postId]/views]", error);
      throw error;
    }
  },
  withIpTracking
);
