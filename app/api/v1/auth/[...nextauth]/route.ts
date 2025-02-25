import { handlers } from "@/lib/auth/auth";

export const { GET, POST } = handlers;

// This route handles all NextAuth.js requests
// Prisma doesn't work in Edge runtime, so we need to use NodeJS runtime
export const runtime = "nodejs";
