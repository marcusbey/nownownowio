import type { Adapter } from "next-auth/adapters";
import type { PrismaClient } from "@prisma/client";

/**
 * Custom Prisma Adapter that doesn't reference the widgetToken field
 * This adapter explicitly defines all the methods needed by NextAuth without
 * relying on the @auth/prisma-adapter implementation which expects widgetToken
 * 
 * @param p PrismaClient instance
 * @returns NextAuth adapter
 */
export function CustomPrismaAdapter(p: PrismaClient): Adapter {
  return {
    createUser: async (data) => {
      const user = await p.user.create({
        data: {
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
        },
      });
      return user;
    },
    
    getUser: async (id) => {
      return p.user.findUnique({ where: { id } });
    },
    
    getUserByEmail: async (email) => {
      return p.user.findUnique({ where: { email } });
    },
    
    getUserByAccount: async ({ provider, providerAccountId }) => {
      const account = await p.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
        select: { user: true },
      });
      return account?.user ?? null;
    },
    
    updateUser: async (data) => {
      return p.user.update({
        where: { id: data.id },
        data: {
          name: data.name,
          email: data.email,
          emailVerified: data.emailVerified,
          image: data.image,
        },
      });
    },
    
    deleteUser: async (userId) => {
      return p.user.delete({ where: { id: userId } });
    },
    
    linkAccount: async (data) => {
      await p.account.create({
        data: {
          userId: data.userId,
          type: data.type,
          provider: data.provider,
          providerAccountId: data.providerAccountId,
          refresh_token: data.refresh_token ? String(data.refresh_token) : null,
          access_token: data.access_token ? String(data.access_token) : null,
          expires_at: data.expires_at,
          token_type: data.token_type ? String(data.token_type) : null,
          scope: data.scope ? String(data.scope) : null,
          id_token: data.id_token ? String(data.id_token) : null,
          session_state: data.session_state ? String(data.session_state) : null,
        },
      });
      return data;
    },
    
    unlinkAccount: async ({ provider, providerAccountId }) => {
      await p.account.delete({
        where: {
          provider_providerAccountId: {
            provider,
            providerAccountId,
          },
        },
      });
    },
    
    createSession: async (data) => {
      return p.session.create({
        data: {
          userId: data.userId,
          expires: data.expires,
          sessionToken: data.sessionToken,
        },
      });
    },
    
    getSessionAndUser: async (sessionToken) => {
      const session = await p.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });
      if (!session) return null;
      return {
        session: {
          userId: session.userId,
          expires: session.expires,
          sessionToken: session.sessionToken,
        },
        user: session.user,
      };
    },
    
    updateSession: async (data) => {
      return p.session.update({
        where: { sessionToken: data.sessionToken },
        data: {
          expires: data.expires,
        },
      });
    },
    
    deleteSession: async (sessionToken) => {
      return p.session.delete({ where: { sessionToken } });
    },
    
    createVerificationToken: async (data) => {
      return p.verificationToken.create({
        data: {
          identifier: data.identifier,
          token: data.token,
          expires: data.expires,
        },
      });
    },
    
    useVerificationToken: async (params) => {
      try {
        return await p.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: params.identifier,
              token: params.token,
            },
          },
        });
      } catch (/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
      _error) {
        // If token does not exist or has been used before, return null
        return null;
      }
    },
  };
}
