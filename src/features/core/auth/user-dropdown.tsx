"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/composite/dropdown-menu";
import { Loader } from "@/components/feedback/loader";
import { Typography } from "@/components/data-display/typography";
import { useMutation } from "@tanstack/react-query";
import {
  LayoutDashboard,
  LogOut,
  Monitor,
  Moon,
  Settings,
  SunMedium,
  SunMoon,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import type { PropsWithChildren } from "react";

export const UserDropdown = ({ children }: PropsWithChildren) => {
  const logout = useMutation({
    mutationFn: async () => signOut({ callbackUrl: '/' }),
  });
  const session = useSession();
  const theme = useTheme();

  // Determine if this is a guest user (no session or in loading state)
  const isGuestUser = !session.data?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {!isGuestUser ? (
          <DropdownMenuLabel>
            <Typography variant="small">
              {session.data.user.name ?? session.data.user.email}
            </Typography>
            <Typography variant="muted">{session.data.user.email}</Typography>
          </DropdownMenuLabel>
        ) : (
          <DropdownMenuLabel>
            <Typography variant="small">Guest User</Typography>
            <Typography variant="muted" className="text-yellow-500">Limited functionality</Typography>
          </DropdownMenuLabel>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/orgs">
            <LayoutDashboard className="mr-2 size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account">
            <Settings className="mr-2 size-4" />
            Account Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <SunMoon className="mr-2 size-4" />
            <span>Theme</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => theme.setTheme("dark")}>
                <Moon className="mr-2 size-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => theme.setTheme("light")}>
                <SunMedium className="mr-2 size-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => theme.setTheme("system")}>
                <Monitor className="mr-2 size-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {!isGuestUser && (
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                logout.mutate();
              }}
            >
              {logout.isPending ? (
                <Loader className="mr-2 size-4" />
              ) : (
                <LogOut className="mr-2 size-4" />
              )}
              <span>Logout</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
        
        {isGuestUser && (
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/auth/signin">
                <LogOut className="mr-2 size-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
