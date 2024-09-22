import { getCachedData } from "@/lib/cache";
import React, { useEffect, useState } from "react";

interface Post {
  id: string;
  content: string;
  createdAt: string;
}

interface User {
  displayName: string;
  avatarUrl: string;
}

interface SidePanelContentProps {
  userId: string;
  token: string;
}

const SidePanelContent: React.FC<SidePanelContentProps> = ({
  userId,
  token,
}) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCachedData(`userData_${userId}`, async () => {
          const response = await fetch(
            `/api/widget/userData?userId=${userId}`,
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
  }, [userId, token]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="sidepanel-content">
      {user && (
        <div className="user-info">
          <img src={user.avatarUrl} alt={user.displayName} className="avatar" />
          <h2>{user.displayName}</h2>
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
