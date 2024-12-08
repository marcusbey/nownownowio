// Start of Selection
import { generateWidgetToken } from '@/lib/now-widget';
import { addDays } from "date-fns";
import { nanoid } from "nanoid";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { env } from "../env";
import { prisma } from "../prisma";
import { AUTH_COOKIE_NAME } from "./auth.const";
import { hashStringWithSalt } from "./helper";

// Password validation
const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const validatePassword = (password: string): boolean => {
  return passwordRegex.test(password);
};

export { hashStringWithSalt } from './helper';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8)
    .regex(
      passwordRegex,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
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
        return null;
      }

      const { email, password } = parsed.data;

      if (!env.NEXTAUTH_SECRET) {
        throw new Error("NEXTAUTH_SECRET is not defined");
      }

      const passwordHash = hashStringWithSalt(password, env.NEXTAUTH_SECRET);

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

  const cookieStore = cookies();

  const token = generateWidgetToken(user.id!);

  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    expires: addDays(new Date(), 365), // Extended to 1 year to match session maxAge
  });
};

// This override cancels JWT strategy for password (it's the default one)
export const credentialsOverrideJwt: JwtOverride = {
  encode() {
    return "";
  },
  decode() {
    return null;
  },
};