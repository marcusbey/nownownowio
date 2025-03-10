import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  type Session = {
    user: DefaultSession["user"] & {
      id: string;
      email: string;
      name?: string;
      image?: string;
    };
    // Flag to detect orphaned sessions (cookie exists but no matching DB record)
    isOrphanedSession?: boolean;
  }
}
