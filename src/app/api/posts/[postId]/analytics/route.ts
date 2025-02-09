import { prisma } from "@/lib/prisma";
import { createApiHandler } from "@/lib/api/apiHandler";
import { withIpTracking } from "@/lib/api/middleware";

// Type-safe analytics types
const AnalyticsTypes = {
  VIEW: "view",
  CHECK_VIEW: "check-view",
} as const;

type AnalyticsType = typeof AnalyticsTypes[keyof typeof AnalyticsTypes];

async function getViewCount(postId: string): Promise<number> {
  try {
    return await prisma.postView.count({ where: { postId } });
  } catch (error) {
    console.error("[Analytics] Error getting view count:", error);
    return 0;
  }
}

async function trackView(postId: string, viewerId: string, clientIp: string): Promise<void> {
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

export const GET = createApiHandler(
  async ({ params, searchParams, middlewareData }) => {
    const type = searchParams?.type as AnalyticsType;
    const postId = params!.postId;

    if (!postId) {
      return { error: "Post ID is required", status: 400 };
    }

    try {
      switch (type) {
        case AnalyticsTypes.VIEW: {
          const count = await getViewCount(postId);
          return { data: { viewCount: count }, status: 200 };
        }

        case AnalyticsTypes.CHECK_VIEW: {
          const { viewerId, clientIp } = middlewareData.ipTracking;
          const existingView = await prisma.postView.findUnique({
            where: {
              postId_viewerId_clientIp: {
                postId,
                viewerId,
                clientIp,
              },
            },
          });
          return { data: { hasViewed: !!existingView }, status: 200 };
        }

        default:
          return { error: "Invalid analytics type", status: 400 };
      }
    } catch (error) {
      console.error("[Analytics] Error:", error);
      return { error: "Internal server error", status: 500 };
    }
  },
  withIpTracking()
);

export const POST = createApiHandler(
  async ({ params, middlewareData }) => {
    const postId = params!.postId;
    const { viewerId, clientIp } = middlewareData.ipTracking;

    if (!postId) {
      return { error: "Post ID is required", status: 400 };
    }

    try {
      await trackView(postId, viewerId, clientIp);
      return { status: 200 };
    } catch (error) {
      console.error("[Analytics] Error tracking view:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return { error: "Post not found", status: 404 };
      }
      return { error: "Internal server error", status: 500 };
    }
  },
  withIpTracking()
);
