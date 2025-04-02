import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { notificationsInclude } from "@/lib/types";
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // --- ENHANCED CACHING STRATEGY ---
  // Define cache headers for more aggressive caching
  const headers = {
    'Cache-Control': 'public, max-age=30, stale-while-revalidate=120', // Cache for 30s, revalidate for 2 mins
    'CDN-Cache-Control': 'public, s-maxage=60', // CDN cache for 1 min
    'Vercel-CDN-Cache-Control': 'public, s-maxage=60' // Vercel specific
  };

  try {
    const user = await auth();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers });
    }

    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get("cursor");
    const limit = 10;

    const notifications = await prisma.notification.findMany({
      where: {
        recipientId: user.id,
      },
      include: notificationsInclude,
      orderBy: {
        createdAt: "desc",
      },
      take: limit + 1,
      ...(cursor
        ? {
            cursor: {
              id: cursor,
            },
          }
        : {}),
    });

    let nextCursor: string | null = null;

    if (notifications.length > limit) {
      const nextItem = notifications.pop();
      nextCursor = nextItem?.id || null;
    }

    return NextResponse.json({
      notifications,
      nextCursor,
    }, { headers });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500, headers }
    );
  }
}
