import { handlers } from "@/lib/auth/auth";

export const runtime = 'nodejs' // Force Node.js runtime

export const { GET, POST } = handlers;
