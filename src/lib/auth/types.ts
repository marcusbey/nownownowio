import "next-auth";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | undefined;
      image?: string | undefined;
      displayName?: string | undefined;
      bio?: string | undefined;
    } & DefaultSession["user"];
  }
}
