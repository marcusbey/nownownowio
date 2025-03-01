"use client";

import { useSession } from "next-auth/react";
import { LoggedInButton, SignInButton } from "./sign-in-button";

export const AuthButtonClient = () => {
  const session = useSession();

  if (session.data) {
    const user = session.data;
    return <LoggedInButton user={user} />;
  }

  return <SignInButton />;
};
