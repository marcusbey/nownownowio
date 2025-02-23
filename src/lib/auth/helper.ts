import type { User } from "@prisma/client";
import { redirect } from "next/navigation";
import { baseAuth } from "./auth";

const isServer = typeof window === "undefined";

export class AuthError extends Error {}

export const auth = async () => {
  const session = await baseAuth();

  if (session?.user) {
    const user = session.user as User;
    return user;
  }

  return null;
};

export const requiredAuth = async () => {
  const user = await auth();

  if (!user) {
    redirect("/auth/signin");
  }

  return user;
};

export const validateRequest = async () => {
  const user = await requiredAuth();
  return { user };
};
