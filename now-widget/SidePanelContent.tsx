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
        console.log("----------user information");
        if (data.success) {
          console.log("Received user data:", data.data.user);
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

  const highlightHashtags = (content: string) => {
    return content.split(" ").map((word, index) =>
      word.startsWith("#") ? (
        <span
          key={index}
          className="now-widget-text-blue-500 now-widget-hover-underline"
        >
          <a href={`/hashtag/${word.slice(1)}`}>{word}</a>
        </span>
      ) : (
        word + " "
      ),
    );
  };

  if (isLoading) return <div className="now-widget-content">Loading...</div>;
  if (error) return <div className="now-widget-error">Error: {error}</div>;

  return (
    <div className="now-widget-wrapper now-widget-left now-widget-h-full now-widget-flex now-widget-flex-col">
      <div className="now-widget-p-6 now-widget-border-b now-widget-sticky now-widget-top-0 now-widget-bg-background now-widget-z-10">
        <div className="now-widget-flex now-widget-items-center now-widget-space-x-4">
          <Avatar className="now-widget-w-16 now-widget-h-16">
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
              className="now-widget-text-lg now-widget-font-semibold now-widget-text-white"
            >
              {user?.displayName || user?.name}
            </Typography>
            <Typography
              variant="p"
              className="now-widget-text-sm now-widget-text-muted-foreground"
            >
              {user?.bio}
            </Typography>
            {/* <Typography
              variant="p"
              className="now-widget-text-xs now-widget-text-muted-foreground now-widget-mt-1"
            >
              {user?.followers.length} followers
            </Typography> */}
          </div>
        </div>
      </div>
      <ScrollArea
        className="now-widget-flex-1 now-widget-overflow-y-auto now-widget-overflow-x-hidden"
        ref={scrollAreaRef}
      >
        <div className="now-widget-p-6 now-widget-space-y-8">
          {posts.map((post) => (
            <div key={post.id} className="now-widget-space-y-2">
              {/* <div className="now-widget-text-xs now-widget-text-muted-foreground">
                {post.createdAt.toLocaleDateString()}
              </div> */}
              {/* {post.type === "text" ? ( */}
              <p className="now-widget-text-sm now-widget-break-words">
                {highlightHashtags(post.content)}
              </p>
              {/* ) : (
                <img
                  src={post.content}
                  alt="Post content"
                  className="now-widget-w-full now-widget-h-auto now-widget-rounded-md now-widget-max-w-full"
                />
              )} */}
              <div className="now-widget-flex now-widget-items-center now-widget-space-x-4 now-widget-text-xs now-widget-text-muted-foreground">
                <div className="now-widget-flex now-widget-items-center now-widget-space-x-1">
                  <MessageSquare className="now-widget-w-3 now-widget-h-3" />
                  <span>{post._count.comments}</span>
                </div>
                <div className="now-widget-flex now-widget-items-center now-widget-space-x-1">
                  <Bookmark className="now-widget-w-3 now-widget-h-3" />
                  <span>{post._count.bookmarks}</span>
                </div>
                <div className="now-widget-flex now-widget-items-center now-widget-space-x-1">
                  <ThumbsUp className="now-widget-w-3 now-widget-h-3" />
                  <span>{post._count.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="now-widget-absolute now-widget-bottom-4 now-widget-right-4 now-widget-bg-primary now-widget-text-primary-foreground now-widget-rounded-full now-widget-p-2 now-widget-shadow-lg now-widget-transition-opacity now-widget-duration-300 now-widget-hover-opacity-80"
          aria-label="Scroll to top"
        >
          <ArrowUp className="now-widget-w-4 now-widget-h-4" />
        </button>
      )}
    </div>
  );
};

export default SidePanelContent;
