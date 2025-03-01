import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Button } from "@/components/core/button";
import { useSession } from "next-auth/react";
import { UserDropdown } from "@/features/core/auth/user-dropdown";
import { useEffect, useState } from "react";

interface CachedUserData {
  name: string | null;
  email: string | null;
  image: string | null;
  timestamp: number;
}

export const SidebarUserButton = () => {
  const session = useSession();
  const [cachedUserData, setCachedUserData] = useState<CachedUserData | null>(null);
  
  // Load cached user data
  useEffect(() => {
    try {
      const cachedData = localStorage.getItem('cachedUserData');
      if (cachedData) {
        setCachedUserData(JSON.parse(cachedData));
      }
    } catch (error) {
      console.error('Error loading cached user data:', error);
    }
    
    // Update cache if we have session data
    if (session.status === 'authenticated' && session.data?.user) {
      // Access user data from session.data.user
      const user = session.data.user;
      if (user) {
        const userData: CachedUserData = {
          name: user.name,
          email: user.email,
          image: user.image,
          timestamp: Date.now()
        };
        
        setCachedUserData(userData);
        
        try {
          localStorage.setItem('cachedUserData', JSON.stringify(userData));
        } catch (error) {
          console.error('Error caching user data:', error);
        }
      }
    }
  }, [session.status, session.data]);
  
  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('SidebarUserButton - Session:', session);
      console.log('SidebarUserButton - Session status:', session.status);
      console.log('SidebarUserButton - Session data:', session.data);
      console.log('SidebarUserButton - Session data.user:', session.data?.user);
      console.log('SidebarUserButton - Session data keys:', session.data ? Object.keys(session.data) : 'No data');
      console.log('SidebarUserButton - Cached data:', cachedUserData);
      
      // Deep inspection of session.data structure
      if (session.data) {
        console.log('SidebarUserButton - DEEP INSPECTION:');
        for (const key in session.data) {
          console.log(`Key: ${key}, Type: ${typeof session.data[key]}`);
          if (typeof session.data[key] === 'object' && session.data[key] !== null) {
            console.log(`Contents of ${key}:`, session.data[key]);
          }
        }
      }
    }
  }, [session, cachedUserData]);
  
  // Use session data if available, otherwise fall back to cached data
  const userData = (session.status === 'authenticated' && session.data?.user) ? session.data.user : cachedUserData;
  
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
          {userData ? (userData.name || userData.email) : "Guest User"}
        </span>
      </Button>
    </UserDropdown>
  );
};
