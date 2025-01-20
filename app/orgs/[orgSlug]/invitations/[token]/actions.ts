"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { hashStringWithSalt, validatePassword } from "@/lib/auth/credentials-provider";
import { redirect } from "next/navigation";
import { auth } from '@/lib/auth/helper';
import { addHours } from "date-fns";
import { ActionError, action } from "@/lib/actions/safe-actions";

export async function createAccount(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const tokenData = formData.get("tokenData") as string;
  const token = formData.get("token") as string;

  if (!validatePassword(password)) {
    return {
      error: "Password must be at least 8 characters and contain letters and numbers"
    };
  }

  const parsedTokenData = JSON.parse(tokenData);

  try {
    // First verify the invitation exists
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return {
        error: "Invalid or expired invitation link"
      };
    }

    if (verificationToken.expires < new Date()) {
      return {
        error: "This invitation has expired"
      };
    }

    const { orgId, email } = verificationToken.data as { orgId: string; email: string };

    // Check if user exists with password
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        passwordHash: true,
      }
    });

    if (existingUser?.passwordHash) {
      return {
        error: "An account with this email already exists. Please sign in instead."
      };
    }

    // Start a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      let userId: string;

      if (existingUser) {
        // Update existing user (who doesn't have a password)
        const updatedUser = await tx.user.update({
          where: { id: existingUser.id },
          data: {
            name,
            passwordHash: hashStringWithSalt(password, env.NEXTAUTH_SECRET),
            emailVerified: new Date(),
          }
        });
        userId = updatedUser.id;
      } else {
        // Create new user
        const newUser = await tx.user.create({
          data: {
            name,
            email: email,
            passwordHash: hashStringWithSalt(password, env.NEXTAUTH_SECRET),
            emailVerified: new Date(),
          },
        });
        userId = newUser.id;
      }

      // Create the organization membership
      await tx.organizationMembership.create({
        data: {
          organizationId: orgId,
          userId,
          roles: ["MEMBER"],
        },
      });

      // Delete the verification token
      await tx.verificationToken.delete({
        where: { token },
      });

      const organization = await tx.organization.findUnique({ where: { id: orgId } });
      if (!organization) {
        throw new ActionError("Organization not found");
      }

      return { userId, organizationSlug: organization.slug };
    });

    // Create a new session for the user
    const session = await auth();
    if (!session?.user?.id) {
      // If no session, redirect to sign in
      redirect(`/auth/signin?callbackUrl=/orgs/${result.organizationSlug}/settings&email=${encodeURIComponent(email)}`);
    }

    // If we have a session, redirect to org settings
    redirect(`/orgs/${result.organizationSlug}/settings`);
  } catch (error) {
    console.error("Account creation error:", error);
    return {
      error: "Something went wrong while creating your account. Please try again."
    };
  }
}
