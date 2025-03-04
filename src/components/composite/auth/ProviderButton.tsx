"use client";

import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";
import { signIn } from "next-auth/react";
import Image from "next/image";

interface ProviderButtonProps {
  providerId: "google" | "twitter" | "github";
  action: "signin" | "signup";
  className?: string;
}

const providerIcons = {
  google: "/icons/google.svg",
  twitter: "/icons/twitter.svg",
  github: "/icons/github.svg",
};

const providerNames = {
  google: "Google",
  twitter: "Twitter",
  github: "GitHub",
};

export function ProviderButton({
  providerId,
  action,
  className,
}: ProviderButtonProps) {
  const handleSignIn = async () => {
    try {
      await signIn(providerId, {
        callbackUrl: "/dashboard",
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignIn}
      className={cn(
        "relative flex w-full items-center justify-start gap-3 px-4",
        "bg-white text-gray-700 transition-colors",
        "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className,
      )}
    >
      <Image
        src={providerIcons[providerId]}
        alt={`${providerNames[providerId]} logo`}
        width={16}
        height={16}
        className="h-4 w-4 flex-shrink-0"
      />
      <span className="text-sm">{providerNames[providerId]}</span>
    </Button>
  );
}
