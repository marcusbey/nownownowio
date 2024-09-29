import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Typography } from "@/components/ui/typography";
import { getCachedData } from "@/lib/cache";
import { Post, User } from "@/lib/types";
import { ArrowUp, Bookmark, MessageSquare, ThumbsUp } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import "./NowWidgetStyle.css";

interface SidePanelContentProps {
  userId: string;
  token: string;
  posts: Post[];
  user: User | null;
}

const SidePanelContent: React.FC<SidePanelContentProps> = ({
  userId,
  token,
  posts: initialPosts,
  user: initialUser,
}) => {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCachedData(`userData_${userId}`, async () => {
          const response = await fetch(
            `${API_BASE_URL}/api/widget/user-data?userId=${userId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        });

        if (data.success) {
          setPosts(data.data.recentPosts);
          setUser(data.data.user);
        } else {
          throw new Error(data.error || "Failed to fetch data");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId, token, API_BASE_URL]);

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const scrollTop = scrollAreaRef.current.scrollTop;
      setShowScrollTop(scrollTop > 300);
    }
  };

  const scrollToTop = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const currentScrollArea = scrollAreaRef.current;
    if (currentScrollArea) {
      currentScrollArea.addEventListener("scroll", handleScroll);
      return () => {
        currentScrollArea.removeEventListener("scroll", handleScroll);
      };
    }
  }, []);

  if (isLoading) return <div className="p-6 text-white">Loading...</div>;
  if (error) return <div className="p-6 text-white">Error: {error}</div>;

  return (
    <div className="relative h-screen w-80 border-r bg-red-600">
      <div className="sticky top-0 z-10 border-b bg-background p-6">
        <div className="flex items-center space-x-4">
          <Avatar className="size-16">
            <AvatarImage
              src={user?.image || "/placeholder-user.jpg"}
              alt={user?.displayName || user?.name || "User Avatar"}
            />
            <AvatarFallback>
              {user?.displayName
                ? user.displayName
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : user?.name
                  ? user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "??"}
            </AvatarFallback>
          </Avatar>
          <div>
            <Typography
              variant="h2"
              className="text-lg font-semibold text-white"
            >
              {user?.displayName || user?.name}
            </Typography>
            <Typography variant="p" className="text-sm text-muted-foreground">
              {user?.bio}
            </Typography>
            {/* <Typography
              variant="p"
              className="mt-1 text-xs text-muted-foreground"
            >
              {user?.followers} followers
            </Typography> */}
          </div>
        </div>
      </div>
      <ScrollArea
        className="h-[calc(100vh-120px)] space-y-8 p-6"
        ref={scrollAreaRef}
      >
        {posts.map((post) => (
          <div key={post.id} className="space-y-2">
            <div className="text-xs text-muted-foreground">
              {new Date(post.createdAt).toLocaleString()}
            </div>
            {/* {post.content !== "text" ? ( */}
            <p className="text-sm text-white">{post.content}</p>
            {/* // ) : (
            //   <img
            //     src={post.content}
            //     alt="Post content"
            //     className="h-auto w-full rounded-md"
            //   />
            // )} */}
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MessageSquare className="size-3" />
                <span>{post._count.comments}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Bookmark className="size-3" />
                <span>{post._count.bookmarks}</span>
              </div>
              <div className="flex items-center space-x-1">
                <ThumbsUp className="size-3" />
                <span>{post._count.likes}</span>
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="absolute bottom-4 right-4 rounded-full bg-primary p-2 text-primary-foreground shadow-lg transition-opacity duration-300 hover:opacity-80"
          aria-label="Scroll to top"
        >
          <ArrowUp className="size-4" />
        </button>
      )}
    </div>
  );
};

export default SidePanelContent;
