import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Button } from "@/components/core/button";
import { useSession } from "next-auth/react";
import { UserDropdown } from "@/features/core/auth/user-dropdown";
import { Skeleton } from "@/components/feedback/skeleton";
import { useEffect, useState } from "react";

export const SidebarUserButton = () => {
  const session = useSession();
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Debug logging for session structure
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('SidebarUserButton - Session Data:', session);
    }
    
    // If no session after 3 seconds and status is loading, assume offline mode
    const timer = setTimeout(() => {
      if (session.status === "loading") {
        console.warn("Session loading timeout - switching to offline mode");
        setOfflineMode(true);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [session]);
  
  // If session is loading and not in offline mode, show a skeleton
  if (session.status === "loading" && !offlineMode) {
    return (
      <Button variant="outline" className="w-full justify-start">
        <Skeleton className="size-6 rounded-full" />
        <Skeleton className="ml-2 h-4 w-24" />
      </Button>
    );
  }
  
  // Get user data if available
  const user = session.data?.user;
  
  return (
    <UserDropdown>
      <Button variant="outline" className="w-full justify-start">
        <Avatar className="size-6">
          {user?.image ? (
            <AvatarImage src={user.image} />
          ) : (
            <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
          )}
        </Avatar>
        <span className="ml-2 truncate">{user?.name || user?.email || "Guest User"}</span>
      </Button>
    </UserDropdown>
  );
};
