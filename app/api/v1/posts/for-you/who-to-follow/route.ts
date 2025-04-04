import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: Promise<Record<string, string>> }) {
    // Properly await params in Next.js 15, even though we're not using any params in this route
    await params;
    try {
        const user = await auth();
        if (!user) {
            return NextResponse.json(
                { error: "Authentication required to view user suggestions" },
                { status: 401 }
            );
        }

        // Fetch users excluding the current user
        const suggestions = await prisma.user.findMany({
            where: {
                NOT: {
                    id: user.id
                }
            },
            select: getUserDataSelect(user.id),
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