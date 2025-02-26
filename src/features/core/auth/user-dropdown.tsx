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
import { signIn, signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { useEffect } from "react";

export const UserDropdown = ({ children }: PropsWithChildren) => {
  const logout = useMutation({
    mutationFn: async () => signOut({ callbackUrl: '/' }),
  });
  const { data: sessionData, status } = useSession();
  const theme = useTheme();
  
  // Debug the session in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('UserDropdown - Session:', sessionData);
      console.log('UserDropdown - Status:', status);
    }
  }, [sessionData, status]);

  // Determine if this is a guest user (no session or loading failed)
  const isAuthenticated = status === "authenticated" && !!sessionData?.user;
  const user = sessionData?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        {isAuthenticated ? (
          <DropdownMenuLabel>
            <Typography variant="small">
              {user.name ?? user.email}
            </Typography>
            <Typography variant="muted">{user.email}</Typography>
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

        {isAuthenticated ? (
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
        ) : (
          <DropdownMenuGroup>
            <DropdownMenuItem 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                signIn(undefined, { callbackUrl: '/orgs' });
              }}
            >
              <LogOut className="mr-2 size-4" />
              <span>Sign In</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
