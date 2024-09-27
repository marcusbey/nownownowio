import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Typography } from "@/components/ui/typography";
import { getCachedData } from "@/lib/cache";
import { Post, User } from "@/lib/types";
import { Bookmark, MessageSquare, ThumbsUp } from "lucide-react";
import React, { useEffect, useState } from "react";

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

  if (isLoading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error}</div>;

  return (
    <div className="h-screen w-80 border-r border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-4">
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage
              src={user?.image || ""}
              alt={user?.displayName || user?.name || ""}
            />
            <AvatarFallback>
              {user?.displayName?.[0] || user?.name?.[0] || ""}
            </AvatarFallback>
          </Avatar>
          <div>
            <Typography
              variant="h2"
              className="text-lg font-semibold text-white"
            >
              {user?.displayName || user?.name}
            </Typography>
            <Typography variant="p" className="text-sm text-gray-400">
              {user?.bio}
            </Typography>
          </div>
        </div>
        {/* You might want to add a followers count here if available in your user data */}
      </div>
      <ScrollArea className="h-[calc(100vh-120px)]">
        <div className="space-y-6 p-4">
          {posts.map((post) => (
            <div key={post.id} className="space-y-2">
              <Typography variant="small" className="text-sm text-gray-400">
                {new Date(post.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="p" className="text-sm text-white">
                {post.content}
              </Typography>
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <MessageSquare className="size-3" />
                  <span>{post._count.comments}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Bookmark className="size-3" />
                  <span>{post._count.bookmarks}</span>
                </div>
                {/* Added Likes Count */}
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="size-3" />
                  <span>{post._count.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default SidePanelContent;
