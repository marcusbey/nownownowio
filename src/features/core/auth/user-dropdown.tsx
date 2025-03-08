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
    mutationFn: async () => {
      // Clear any cached user data from localStorage
      try {
        // Clear all potential user data from localStorage
        localStorage.removeItem('cachedUserData');
        localStorage.removeItem('next-auth.session-token');
        localStorage.removeItem('next-auth.callback-url');
        localStorage.removeItem('next-auth.csrf-token');
        
        // Clear session cookies by setting their expiration to the past
        document.cookie.split(';').forEach(cookie => {
          const [name] = cookie.split('=').map(c => c.trim());
          if (name.includes('next-auth') || name.includes('authjs')) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
          }
        });
      } catch (error) {
        console.error('Error clearing cached user data during logout:', error);
      }
      
      // Force a complete session cleanup and redirect to home
      // Use a combination of NextAuth signOut and manual page reload
      await signOut({ 
        callbackUrl: "/", 
        redirect: false, // Don't redirect yet, we'll do it manually
      });
      
      // Force a complete page reload to clear any in-memory state
      window.location.href = "/";
      return;
    },
  });
  const session = useSession();
  const theme = useTheme();
  

  
  // Get user data if available
  const user = session.data as SessionUser | undefined;
  
  interface SessionUser {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    [key: string]: any; // Allow for other session properties
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>
          <Typography variant="small">
            {user?.name ?? user?.email ?? (session.status === 'loading' ? "Loading..." : "Sign In")}
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
