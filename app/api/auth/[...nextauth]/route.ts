import { handlers } from "@/lib/auth/auth";

export const { GET, POST } = handlers;

// This route handles all NextAuth.js requests
export const runtime = "edge";
