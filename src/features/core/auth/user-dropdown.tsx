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
import { Typography } from "@/components/data-display/typography";
import { Loader } from "@/components/feedback/loader";
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
import { useEffect } from "react";
import type { PropsWithChildren } from "react";

export const UserDropdown = ({ children }: PropsWithChildren) => {
  const logout = useMutation({
    mutationFn: async () => signOut({ callbackUrl: "/" }),
  });
  const session = useSession();
  const theme = useTheme();
  
  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('UserDropdown - Session:', session);
      console.log('UserDropdown - Session status:', session.status);
      console.log('UserDropdown - Session data:', session.data);
      console.log('UserDropdown - Session data.user:', session.data?.user);
      console.log('UserDropdown - Session data keys:', session.data ? Object.keys(session.data) : 'No data');
      
      // Deep inspection of session.data structure
      if (session.data) {
        console.log('UserDropdown - DEEP INSPECTION:');
        for (const key in session.data) {
          console.log(`Key: ${key}, Type: ${typeof session.data[key]}`);
          if (typeof session.data[key] === 'object' && session.data[key] !== null) {
            console.log(`Contents of ${key}:`, session.data[key]);
          }
        }
      }
    }
  }, [session]);
  
  // Get user data if available
  const user = session.data?.user;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <Typography variant="small">
            {user?.name ?? user?.email ?? "Guest User"}
          </Typography>
          {user?.email && <Typography variant="muted">{user.email}</Typography>}
        </DropdownMenuLabel>

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

        <DropdownMenuGroup>
          {user ? (
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
          ) : (
            <DropdownMenuItem asChild>
              <Link href="/auth/signin">
                <LogOut className="mr-2 size-4" />
                <span>Sign In</span>
              </Link>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
