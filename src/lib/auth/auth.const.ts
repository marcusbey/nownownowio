// NextAuth 5.0 beta doesn't export NextAuthOptions directly
import type { NextAuthConfig } from "next-auth";

export const AUTH_COOKIE_NAME =
  process.env.NODE_ENV === "development"
    ? "authjs.session-token"
    : "__Secure-authjs.session-token";

export const authOptions: NextAuthConfig = {
  basePath: '/api/v1/auth',
  providers: [],
  session: {
    strategy: 'database',
  },
  cookies: {
    sessionToken: {
      name: AUTH_COOKIE_NAME,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};
