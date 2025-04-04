import { prisma as db } from "@/lib/prisma";
import { env } from "@/lib/env";
import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/auth/signin?error=InvalidToken`);
  }

  try {
    // Find the verification token
    const verificationToken = await db.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.redirect(`${env.NEXTAUTH_URL}/auth/signin?error=TokenNotFound`);
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      await db.verificationToken.delete({ where: { token } });
      return NextResponse.redirect(`${env.NEXTAUTH_URL}/auth/signin?error=TokenExpired`);
    }

    // Update user and delete token
    await db.$transaction([
      db.user.update({
        where: { id: verificationToken.user.id },
        data: { emailVerified: new Date() },
      }),
      db.verificationToken.delete({ where: { token } }),
    ]);

    // Redirect to success page
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/auth/signin?verified=true`);
  } catch (error) {
    logger.error("Error verifying email", { error });
    return NextResponse.redirect(`${env.NEXTAUTH_URL}/auth/signin?error=VerificationFailed`);
  }
}
