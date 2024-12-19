"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { hashStringWithSalt, validatePassword } from "@/lib/auth/credentials-provider";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";

export async function createAccount(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const tokenData = formData.get("tokenData") as string;
  const organizationId = formData.get("organizationId") as string;
  const organizationSlug = formData.get("organizationSlug") as string;
  const token = formData.get("token") as string;

  try {
    if (!validatePassword(password)) {
      return {
        error: "Password must be at least 8 characters and contain letters and numbers"
      };
    }

    const parsedTokenData = JSON.parse(tokenData);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: parsedTokenData.email,
      },
      select: {
        id: true,
        passwordHash: true,
      }
    });

    let userId: string;

    if (existingUser) {
      // If user exists but has no password (incomplete registration)
      if (!existingUser.passwordHash) {
        // Update the existing user
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            name,
            passwordHash: hashStringWithSalt(password, env.NEXTAUTH_SECRET),
            emailVerified: new Date(),
          }
        });
        userId = existingUser.id;
      } else {
        // User exists and has password - they should sign in
        return {
          error: "An account with this email already exists. Please sign in instead."
        };
      }
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: parsedTokenData.email,
          name,
          passwordHash: hashStringWithSalt(password, env.NEXTAUTH_SECRET),
          emailVerified: new Date(),
        },
      });
      userId = newUser.id;
    }

    // Check if membership already exists
    const existingMembership = await prisma.organizationMembership.findFirst({
      where: {
        organizationId,
        userId,
      }
    });

    // Create the organization membership if it doesn't exist
    if (!existingMembership) {
      await prisma.organizationMembership.create({
        data: {
          organizationId,
          userId,
          roles: ["MEMBER"],
        },
      });
    }

    // Delete the invitation token
    await prisma.verificationToken.delete({
      where: {
        token,
      },
    });

    // Create a new session for the user
    const session = await getServerSession(authOptions);
    if (!session) {
      // If no session, redirect to sign in
      redirect(`/auth/signin?callbackUrl=/orgs/${organizationSlug}/settings&email=${encodeURIComponent(parsedTokenData.email)}`);
    }

    // If we have a session, redirect to org settings
    redirect(`/orgs/${organizationSlug}/settings`);
  } catch (error) {
    console.error("Account creation error:", error);
    return {
      error: error instanceof Error ? error.message : "Something went wrong"
    };
  }
}
