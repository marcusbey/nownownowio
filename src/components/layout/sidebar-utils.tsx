"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SidebarMenuButtonProps } from "./sidebar";
import { SidebarMenuButton } from "./sidebar";

export const SidebarMenuButtonLink = ({
  href,
  children,
  className,
  ...props
}: SidebarMenuButtonProps & { href: string }) => {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <SidebarMenuButton
      {...props}
      asChild
      isActive={isActive}
      className={cn(
        "w-full transition-all",
        isActive
          ? "font-medium text-primary"
          : "text-muted-foreground hover:text-foreground",
        className,
      )}
    >
      <Link
        href={href}
        className="flex w-full items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/50"
      >
        {children}
      </Link>
    </SidebarMenuButton>
  );
};
