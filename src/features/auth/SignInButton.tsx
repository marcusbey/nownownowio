"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { useIsClient } from "@/hooks/useIsClient";
import type { VariantProps } from "class-variance-authority";
import Link from "next/link";
import { UserDropdown } from "./UserDropdown";

const useHref = () => {
  const isClient = useIsClient();

  if (!isClient) {
    return "";
  }

  const href = window.location.href;

  return `${href}`;
};

export const SignInButton = (props: VariantProps<typeof buttonVariants>) => {
  const href = useHref();

  return (
    <Link
      className={buttonVariants({ size: "sm", variant: "outline", ...props })}
      href={`/auth/signin?callbackUrl=${href}`}
    >
      Sign in
    </Link>
  );
};

export const LoggedInButton = ({
  user,
}: {
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
}) => {
  return (
    <UserDropdown>
      <button className="group size-9 rounded-full">
        <Avatar className="mr-2 size-full group-active:scale-95">
          <AvatarImage 
            src={user.image || "/images/avatar-placeholder.png"} 
            alt={user.name || user.email}
          />
          <AvatarFallback className="bg-card">
            {user.name?.slice(0, 1).toUpperCase() || user.email.slice(0, 1).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </button>
    </UserDropdown>
  );
};
