"use client";

import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import Image from "next/image";

type ProviderButtonProps = {
  providerId: "google" | "twitter" | "github";
  action: "signin" | "signup";
  className?: string;
}

const providerIcons = {
  google: "/icons/google.svg",
  twitter: "/icons/x.svg",
  github: "/icons/github.svg",
};

const providerNames = {
  google: "Google",
  twitter: "X",
  github: "GitHub",
};

export function ProviderButton({
  providerId,
  // action parameter is used in the type definition but not in the component
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  action,
  className,
}: ProviderButtonProps) {
  const handleSignIn = async () => {
    try {
      // Redirect to the organization page instead of dashboard
      await signIn(providerId, {
        callbackUrl: "/orgs",
      });
    } catch (error) {
      // Silent fail - errors will be handled by NextAuth's built-in error handling
      // We don't need to log here as NextAuth will show appropriate errors
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignIn}
      className={cn(
        "relative flex w-full items-center justify-center gap-2 px-4 py-3",
        "bg-white text-gray-800 font-medium transition-colors rounded-md",
        "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className,
      )}
    >
      <Image
        src={providerIcons[providerId]}
        alt={`${providerNames[providerId]} logo`}
        width={20}
        height={20}
        className="size-5 shrink-0"
      />
      <span>Sign up with {providerNames[providerId]}</span>
    </Button>
  );
}
