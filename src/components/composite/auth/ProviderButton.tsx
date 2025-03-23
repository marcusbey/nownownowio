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

  // Get provider-specific gradients that match the hero theme
  const getProviderGradient = () => {
    switch(providerId) {
      case "google":
        return {
          gradient: "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400",
          hoverGradient: "hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500",
          iconBg: "bg-white"
        };
      case "twitter":
        return {
          gradient: "bg-gradient-to-r from-purple-400 via-fuchsia-400 to-pink-400",
          hoverGradient: "hover:from-purple-500 hover:via-fuchsia-500 hover:to-pink-500",
          iconBg: "bg-white"
        };
      case "github":
        return {
          gradient: "bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400",
          hoverGradient: "hover:from-cyan-500 hover:via-blue-500 hover:to-indigo-500",
          iconBg: "bg-white"
        };
      default:
        return {
          gradient: "bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400",
          hoverGradient: "hover:from-blue-500 hover:via-indigo-500 hover:to-purple-500",
          iconBg: "bg-white"
        };
    }
  };

  const gradientStyle = getProviderGradient();

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleSignIn}
      className={cn(
        "relative flex w-full items-center justify-center gap-3 px-5 py-3",
        "text-white font-medium transition-all duration-300 rounded-md",
        "shadow-sm hover:shadow-md focus:outline-none",
        "focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 border-0",
        gradientStyle.gradient,
        gradientStyle.hoverGradient,
        "dark:ring-offset-slate-900",
        className,
      )}
    >
      <div className="flex items-center justify-center bg-white rounded-full p-2 shadow-sm">
        <Image
          src={providerIcons[providerId]}
          alt={`${providerNames[providerId]} logo`}
          width={24}
          height={24}
          className="size-5 shrink-0"
        />
      </div>
      <span className="font-semibold">Sign up with {providerNames[providerId]}</span>
    </Button>
  );
}
