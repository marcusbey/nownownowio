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
        <span key={index} className="now-widget-hashtag">
          <a href={`/hashtag/${word.slice(1)}`}>{word}</a>
        </span>
      ) : (
        <span key={index}>{word} </span>
      ),
    );
  };

  if (isLoading) return <div className="now-widget-loading">Loading...</div>;
  if (error) return <div className="now-widget-error">Error: {error}</div>;

  return (
    <div className="now-widget-sidepanel-wrapper">
      <div className="now-widget-header">
        <div className="now-widget-user-info">
          <Avatar className="now-widget-avatar">
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
          <div className="now-widget-user-details">
            <Typography variant="h2" className="now-widget-user-name">
              {user?.displayName || user?.name}
            </Typography>
            <Typography variant="p" className="now-widget-user-bio">
              {user?.bio}
            </Typography>
            {/* <Typography
              variant="p"
              className="now-widget-user-followers"
            >
              {user?.followers.length} followers
            </Typography> */}
          </div>
        </div>
      </div>
      <ScrollArea className="now-widget-posts-container" ref={scrollAreaRef}>
        <div className="now-widget-posts-list">
          {posts.map((post) => (
            <div key={post.id} className="now-widget-post-item">
              {/* <div className="now-widget-post-date">
                {post.createdAt.toLocaleDateString()}
              </div> */}
              {/* {post.type === "text" ? ( */}
              <p className="now-widget-post-content">
                {highlightHashtags(post.content)}
              </p>
              {/* ) : (
                <img
                  src={post.content}
                  alt="Post content"
                  className="now-widget-post-image"
                />
              )} */}
              <div className="now-widget-post-footer">
                <div className="now-widget-post-interaction">
                  <MessageSquare className="now-widget-icon" />
                  <span>{post._count.comments}</span>
                </div>
                <div className="now-widget-post-interaction">
                  <Bookmark className="now-widget-icon" />
                  <span>{post._count.bookmarks}</span>
                </div>
                <div className="now-widget-post-interaction">
                  <ThumbsUp className="now-widget-icon" />
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
          className="now-widget-scroll-top-button"
          aria-label="Scroll to top"
        >
          <ArrowUp className="now-widget-arrow-up-icon" />
        </button>
      )}
    </div>
  );
};

export default SidePanelContent;
