import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Button } from "@/components/core/button";
import { useSession } from "next-auth/react";
import { UserDropdown } from "@/features/core/auth/user-dropdown";
import { SignInButton } from "@/features/core/auth/sign-in-button";
import { useEffect, useState } from "react";

type CachedUserData = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  timestamp: number;
}

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  [key: string]: any; // Allow for other session properties
}

export const SidebarUserButton = () => {
  const session = useSession();
  const [cachedUserData, setCachedUserData] = useState<CachedUserData | null>(null);
  
  // Load cached user data and update cache if we have session data
  useEffect(() => {
    // Clear cached data when session is unauthenticated (logged out)
    if (session.status === 'unauthenticated') {
      try {
        localStorage.removeItem('cachedUserData');
        setCachedUserData(null);
      } catch (error) {
        console.error('Error clearing cached user data:', error);
      }
      return;
    }
    
    // Load cached user data if session is loading
    if (session.status === 'loading') {
      try {
        const cachedData = localStorage.getItem('cachedUserData');
        if (cachedData) {
          setCachedUserData(JSON.parse(cachedData));
        }
      } catch (error) {
        console.error('Error loading cached user data:', error);
      }
    }
    
    // Update cache if we have session data
    if (session.status === 'authenticated' && session.data) {
      const sessionData = session.data as SessionUser;
      
      const userData: CachedUserData = {
        name: sessionData.name,
        email: sessionData.email,
        image: sessionData.image,
        timestamp: Date.now()
      };
      
      setCachedUserData(userData);
      
      try {
        localStorage.setItem('cachedUserData', JSON.stringify(userData));
      } catch (error) {
        console.error('Error caching user data:', error);
      }
    }
  }, [session.status, session.data]);
  
  // Only use cached data if we're in the loading state and have cached data
  // This prevents showing cached data when actually logged out
  const shouldUseCachedData = session.status === 'loading' && cachedUserData !== null;
  
  // Use session data if authenticated, cached data only during loading, otherwise null
  const userData = (session.status === 'authenticated' && session.data) 
    ? (session.data as SessionUser) 
    : (shouldUseCachedData ? cachedUserData : null);
  
  // Show sign in button if logged out
  if (session.status === 'unauthenticated') {
    return <SignInButton className="w-full" />;
  }
  
  // Show loading state if we're loading and don't have cached data
  if (session.status === 'loading' && !userData) {
    return (
      <Button variant="outline" className="w-full justify-start" disabled>
        <span className="ml-2 truncate">Loading...</span>
      </Button>
    );
  }
  
  // Show user dropdown if authenticated or have cached data during loading
  return (
    <UserDropdown>
      <Button variant="outline" className="w-full justify-start">
        <Avatar className="size-6">
          {userData?.image ? (
            <AvatarImage src={userData.image} alt={userData.name || "User"} />
          ) : (
            <AvatarFallback>{userData?.name?.[0] ?? "U"}</AvatarFallback>
          )}
        </Avatar>
        <span className="ml-2 truncate">
          {userData.name || userData.email || "User"}
        </span>
      </Button>
    </UserDropdown>
  );
};
