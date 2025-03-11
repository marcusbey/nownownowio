import { auth } from "@/lib/auth/helper";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { hashStringWithSalt } from "@/lib/auth/credentials-provider";
import { env } from "@/lib/env";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Schema for password validation
const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
  try {
    // Get the current user
    const session = await auth();
    
    if (!session?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate the request body
    const body = await req.json();
    
    const validationResult = passwordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { message: validationResult.error.errors[0].message },
        { status: 400 }
      );
    }
    
    const { newPassword } = validationResult.data;
    
    // Hash the password using the auth secret as salt
    const passwordHash = hashStringWithSalt(newPassword, env.AUTH_SECRET);
    
    // Update the user's password
    await prisma.user.update({
      where: { id: session.id },
      data: { passwordHash },
    });
    
    // Log the update for debugging
    logger.info(`Password updated for user ${session.id}`);
    
    return NextResponse.json(
      { message: "Password set successfully" },
      { status: 200 }
    );
  } catch (error) {
    logger.error("Error setting password:", error);
    return NextResponse.json(
      { message: "Failed to set password" },
      { status: 500 }
    );
  }
}
