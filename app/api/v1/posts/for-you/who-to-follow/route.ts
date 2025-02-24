import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json([], { status: 401 });
        }

        // Fetch users excluding the current user
        const suggestions = await prisma.user.findMany({
            where: {
                NOT: {
                    id: session.user.id
                }
            },
            select: getUserDataSelect(session.user.id),
            take: 5,
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Failed to fetch who to follow:', error);
        return NextResponse.json({ error: "Failed to fetch who to follow" }, { status: 500 });
    }
}