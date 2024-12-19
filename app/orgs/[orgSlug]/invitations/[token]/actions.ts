"use server";

import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { hashStringWithSalt, validatePassword } from "@/lib/auth/credentials-provider";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";

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

    // Create the user account
    const user = await prisma.user.create({
      data: {
        email: parsedTokenData.email,
        name,
        passwordHash: hashStringWithSalt(password, env.NEXTAUTH_SECRET),
        emailVerified: new Date(), // Email is verified through invitation
      },
    });

    // Create the organization membership
    await prisma.organizationMembership.create({
      data: {
        organizationId,
        userId: user.id,
        roles: ["MEMBER"],
      },
    });

    // Delete the invitation token
    await prisma.verificationToken.delete({
      where: {
        token,
      },
    });

    // Sign them in automatically using server-side auth
    const response = await signIn("credentials", {
      email: parsedTokenData.email,
      password,
      redirect: false,
      callbackUrl: `/orgs/${organizationSlug}/settings`,
    });

    if (response?.error) {
      return { error: "Failed to sign in automatically" };
    }

    redirect(`/orgs/${organizationSlug}/settings`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Something went wrong"
    };
  }
}
