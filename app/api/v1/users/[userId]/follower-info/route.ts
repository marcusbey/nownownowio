import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
// If needed, you can also import & use your auth checks
// import { validateRequest } from "@/lib/auth/helper";

export async function GET(
    request: Request,
    { params }: { params: { userId: string } }
) {
    try {
        // Optional: const { user } = await validateRequest();
        // Optional check: if (!user) return NextResponse.json([], { status: 401 });

        // Await params before using its properties
        const awaitedParams = await params;
        const userId = awaitedParams.userId;

        // Example: fetch follower info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                followers: true,
                _count: {
                    select: { followers: true },
                },
            },
        });

        // Build a simple structure that matches your FollowerInfo interface
        const data = {
            followers: user?._count.followers ?? 0,
            isFollowedByUser: false, // or some logic to see if current user follows them
        };

        return NextResponse.json(data);
    } catch (error) {
        console.error("Failed to get follower info:", error);
        return NextResponse.json({ error: "Failed to get follower info" }, { status: 500 });
    }
} 