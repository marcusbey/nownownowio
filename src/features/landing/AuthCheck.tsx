'use client';

import { SignUpProviders } from "@/app/auth/signup/SignUpProviders";
import { useSession } from "next-auth/react";

export function AuthCheck() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl">
        <SignUpProviders />
      </div>
    );
  }

  return null;
}
