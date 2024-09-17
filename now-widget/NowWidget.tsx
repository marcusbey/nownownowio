import React, { useCallback, useEffect, useState } from "react";
import NowButton from "./NowButton";
import "./NowWidgetStyle.css";

interface Post {
  id: string;
  content: string;
  createdAt: string;
}

interface WidgetConfig {
  userId: string;
  token: string;
  theme?: 'light' | 'dark';
  position?: 'left' | 'right';
  buttonColor?: string;
  buttonSize?: number;
}

const NowWidget: React.FC<WidgetConfig> = ({
  userId,
  token,
  theme = 'light',
  position = 'right',
  buttonColor = 'red',
  buttonSize = 150,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-widget-theme', theme);
    document.body.setAttribute('data-widget-position', position);

    // Create base wrapper for main content
    const baseWrapper = document.createElement('div');
    baseWrapper.id = 'base__wrapper';
    while (document.body.children.length > 0) {
      baseWrapper.appendChild(document.body.children[0]);
    }
    document.body.appendChild(baseWrapper);

    // Cleanup function
    return () => {
      document.body.removeAttribute('data-widget-theme');
      document.body.removeAttribute('data-widget-position');
      while (baseWrapper.children.length > 0) {
        document.body.appendChild(baseWrapper.children[0]);
      }
      baseWrapper.remove();
    };
  }, [theme, position]);

  const fetchPosts = useCallback(async () => {
    if (!isOpen) return; // Don't fetch if the panel is closed

    setIsLoading(true);
    setError(null);
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/widget/user-data`;
      const response = await fetch(apiUrl, {
        headers: {
          "x-user-id": userId,
          "x-api-key": token,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setPosts(data.data.recentPosts);
        // You can also use data.data.user for user information if needed
      } else {
        throw new Error(data.error || "Failed to load data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, userId, token]); // Dependencies added to useCallback

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // This will run when isOpen changes

  const togglePanel = () => {
    setIsOpen(prev => !prev);
    const baseWrapper = document.getElementById('base__wrapper');
    const sidePanel = document.getElementById('now__sidepanel');
    
    if (baseWrapper && sidePanel) {
      if (!isOpen) {
        sidePanel.style.left = '0';
        if (window.innerWidth > 768) {
          baseWrapper.style.transform = 'translateX(50%)';
        }
      } else {
        sidePanel.style.left = window.innerWidth > 768 ? '-50%' : '-100%';
        baseWrapper.style.transform = 'translateX(0)';
      }
    }
  };

  return (
    <div className={`now-widget-wrapper ${theme} ${position}`}>
      <div id="now-button-container">
        <NowButton
          onClick={togglePanel}
          size={buttonSize}
          color={buttonColor}
          backgroundColor="transparent"
          updated={posts.length > 0}
        />
      </div>
      <div id="now__sidepanel" className={isOpen ? "open" : ""}>
        <span className="closebtn" onClick={togglePanel}>
          &times;
        </span>
        <div id="sidepanel-content">
          {isLoading && <p>Loading...</p>}
          {error && <p className="error-message">Error: {error}</p>}
          {!isLoading && !error && (
            <ul>
              {posts.map((post) => (
                <li key={post.id}>
                  <div>
                    <strong>{post.content}</strong>
                  </div>
                  <div>
                    <em>{new Date(post.createdAt).toLocaleString()}</em>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {!isLoading && !error && posts.length === 0 && (
            <p>No posts available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NowWidget;

// Add this at the end of the file
if (typeof window !== 'undefined') {
  (window as any).NowNowNowWidget = NowWidget;
}