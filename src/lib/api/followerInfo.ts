import { prisma } from "@/lib/prisma";
import type { FollowerInfo } from "@/lib/types";

export async function getFollowerInfo(userId: string): Promise<FollowerInfo> {
    // Example DB lookup
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { _count: { select: { followers: true } } },
    });

    // Return default if missing
    return {
        followers: user?._count.followers ?? 0,
        isFollowedByUser: false,
    };
} 