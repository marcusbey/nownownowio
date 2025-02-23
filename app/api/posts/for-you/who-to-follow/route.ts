import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { NextResponse } from "next/server";

// Example data route for who-to-follow
export async function GET() {
    try {
        // If you need user info, implement and call your auth method here
        // const { user } = await validateRequest();
        // if (!user) return NextResponse.json([]);

        // For demonstration, we'll fetch random users
        const randomUsers = await prisma.user.findMany({
            where: {
                // Skip user ID if you have it
            },
            select: getUserDataSelect("dummyUserIdIfNeeded"),
            take: 5,
        });

        return NextResponse.json(randomUsers);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch who to follow" }, { status: 500 });
    }
} 