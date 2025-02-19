import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import { env } from "../env";
import { prisma } from "../prisma";
import {
  setupDefaultOrganizationsOrInviteUser,
  setupResendCustomer,
} from "./auth-config-setup";
import {
  credentialsOverrideJwt,
  credentialsSignInCallback,
} from "./credentials-provider";
import { getNextAuthConfigProviders } from "./getNextAuthConfigProviders";

export const { handlers, auth: baseAuth } = NextAuth((req) => ({
  pages: {
    signIn: "/v1/auth/signin",
    signOut: "/v1/auth/signout",
    error: "/v1/auth/error",
    verifyRequest: "/v1/auth/verify-request",
    newUser: "/v1/orgs",
  },
  adapter: PrismaAdapter(prisma),
  providers: getNextAuthConfigProviders(),
  session: {
    strategy: "database",
  },
  secret: env.AUTH_SECRET,
  callbacks: {
    session: (params) => {
      // @ts-expect-error - NextAuth doesn't know about this property
      params.session.user.passwordHash = null;
      return params.session;
    },
  },
  events: {
    signIn: credentialsSignInCallback(req),
    createUser: async (message) => {
      const user = message.user;

      if (!user.email) {
        return;
      }

      const resendContactId = await setupResendCustomer(user);

      await setupDefaultOrganizationsOrInviteUser(user);

      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          resendContactId,
        },
      });
    },
  },
  jwt: credentialsOverrideJwt,
}));
