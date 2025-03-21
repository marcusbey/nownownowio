import { requiredAuth } from "@/lib/auth/helper";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * This is a nuclear option that deletes ALL sessions from the database.
 * Use only as a last resort when persistent session errors can't be resolved.
 * Only admins can use this endpoint.
 */
export async function POST() {
    try {
        // Only allow this in development or with admin privileges
        const user = await requiredAuth();

        // Check if user is authorized
        const isAdmin = user.email.endsWith('@nownownow.io') ||
            user.email === process.env.ADMIN_EMAIL;

        if (!isAdmin && process.env.NODE_ENV === 'production') {
            logger.warn("Unauthorized attempt to nuke sessions", { userId: user.id, email: user.email });
            return new NextResponse(JSON.stringify({
                error: "Unauthorized. Only admins can use this feature in production."
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete all sessions (use with extreme caution!)
        const { count } = await prisma.session.deleteMany({});

        logger.info(`Nuked ${count} sessions from database`, {
            userId: user.id,
            email: user.email
        });

        return new NextResponse(JSON.stringify({
            success: true,
            message: `Successfully deleted ${count} sessions`,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        logger.error("Error nuking sessions:", error);

        return new NextResponse(JSON.stringify({
            error: "Failed to nuke sessions",
            details: error instanceof Error ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 