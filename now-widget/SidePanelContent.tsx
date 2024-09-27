import { getCachedData } from "@/lib/cache";
import { Post, User } from "@/lib/types/prisma";
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

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="sidepanel-content">
      {user && (
        <div className="user-info">
          <img
            src={user.image || ""}
            alt={user.displayName || user.name || ""}
            className="avatar"
          />
          <h2>{user.displayName || user.name}</h2>
          {user.bio && <p>{user.bio}</p>}
        </div>
      )}
      <h3>Recent Posts</h3>
      {posts.length === 0 ? (
        <p>No posts available.</p>
      ) : (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <p>{post.content}</p>
              <small>{new Date(post.createdAt).toLocaleString()}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SidePanelContent;
