import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import { z } from "zod";

const ResetSchema = z.object({
    email: z.string().email(),
    resetCode: z.string().min(5),
});

/**
 * This endpoint allows resetting a specific user's sessions when they are locked out
 * It requires a special reset code that matches one set in the environment variables
 */
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json();
        const validationResult = ResetSchema.safeParse(body);

        if (!validationResult.success) {
            return new NextResponse(JSON.stringify({
                error: "Invalid request",
                details: validationResult.error.message
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { email, resetCode } = validationResult.data;

        // Verify reset code (stored in environment variable)
        const validResetCode = process.env.SESSION_RESET_CODE;

        if (!validResetCode || resetCode !== validResetCode) {
            logger.warn("Invalid reset code used", { email });
            return new NextResponse(JSON.stringify({
                error: "Invalid reset code"
            }), {
                status: 403,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true }
        });

        if (!user) {
            return new NextResponse(JSON.stringify({
                error: "User not found"
            }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Delete all sessions for this user
        const { count } = await prisma.session.deleteMany({
            where: { userId: user.id }
        });

        // Create a reset token they can use to sign in
        const token = nanoid(32);
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await prisma.verificationToken.create({
            data: {
                identifier: `${user.id}-reset`,
                token,
                expires,
                data: { type: "session-reset" }
            },
        });

        logger.info(`Reset ${count} sessions for user`, {
            userId: user.id,
            email: user.email,
            resetType: "public-reset"
        });

        return new NextResponse(JSON.stringify({
            success: true,
            message: `Successfully reset ${count} sessions for ${email}`,
            resetUrl: `/auth/reset/${token}`,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        logger.error("Error during public reset:", error);

        return new NextResponse(JSON.stringify({
            error: "Failed to reset sessions",
            details: error instanceof Error ? error.message : String(error)
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
} 