// Start of Selection
import { generateWidgetToken } from '@/lib/widget/widgetAuth';
import crypto from "crypto";
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { z } from "zod"; // Added zod import
import { env } from "../env";
import { prisma } from "../prisma";
import { AUTH_COOKIE_NAME } from "./auth.const";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export const validatePassword = (password: string): boolean => {
  return PASSWORD_REGEX.test(password);
};

export const hashStringWithSalt = (string: string, salt: string): string => {
  const hash = crypto.createHash("sha256");
  const saltedString = salt + string;
  hash.update(saltedString);
  return hash.digest("hex");
};

// Define a Zod schema for credentials
const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(PASSWORD_REGEX, "Password must be at least 8 characters long and include letters and numbers."),
});

export const getCredentialsProvider = () => {
  return CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "text", placeholder: "Your email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      if (!credentials) {
        return null;
      }

      // Validate credentials using Zod
      const parsed = credentialsSchema.safeParse(credentials);
      if (!parsed.success) {
        // You can handle validation errors here if needed
        return null;
      }

      const { email, password } = parsed.data;

      if (!env.NEXTAUTH_SECRET) {
        throw new Error("NEXTAUTH_SECRET is not defined");
      }

      const passwordHash = hashStringWithSalt(
        password,
        env.NEXTAUTH_SECRET
      );

      const user = await prisma.user.findFirst({
        where: {
          email: email,
          passwordHash: passwordHash,
        },
      });

      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      } else {
        return null;
      }
    },
  });
};

type SignInCallback = NonNullable<NextAuthConfig["events"]>["signIn"];

type JwtOverride = NonNullable<NextAuthConfig["jwt"]>;

export const credentialsSignInCallback = (request: NextRequest | undefined): SignInCallback => async ({ user }) => {
  if (!request) {
    return;
  }

  if (request.method !== "POST") {
    return;
  }

  const currentUrl = request.url;

  if (!currentUrl.includes("credentials") || !currentUrl.includes("callback")) {
    return;
  }

  const uuid = nanoid();
  const expireAt = addDays(new Date(), 14);
  await prisma.session.create({
    data: {
      sessionToken: uuid,
      expires: expireAt,
      user: { connect: { id: user.id } },
    },
  });

  const cookieList = cookies();

  cookieList.set(AUTH_COOKIE_NAME, uuid, {
    expires: expireAt,
    path: "/",
    sameSite: "lax",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
  });

  // Generate widget token
  const widgetToken = generateWidgetToken(user.id!);

  // Store the widget token in the user's session or database
  await prisma.user.update({
    where: { id: user.id },
    data: { widgetToken },
  });
};

// This override cancels JWT strategy for password. (it's the default one)
export const credentialsOverrideJwt: JwtOverride = {
  encode() {
    return "";
  },
  async decode() {
    return null;
  },
};