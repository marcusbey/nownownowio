import { getCachedData } from "@/lib/cache";
import React, { lazy, Suspense, useEffect, useState } from "react";
import NowButton from "./NowButton";
import "./NowWidgetStyle.css";

const SidePanelContent = lazy(() => import("./SidePanelContent"));

interface Post {
  id: string;
  content: string;
  createdAt: string;
}

interface User {
  displayName: string;
  avatarUrl: string;
}

interface WidgetConfig {
  userId: string;
  token: string;
  theme?: "light" | "dark";
  position?: "left" | "right";
  buttonColor?: string;
  buttonSize?: number;
}

const NowWidget: React.FC<WidgetConfig> = ({
  userId,
  token,
  theme = "light",
  position = "right",
  buttonColor = "red",
  buttonSize = 150,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    document.body.setAttribute("data-widget-theme", theme);
    document.body.setAttribute("data-widget-position", position);

    const baseWrapper = document.createElement("div");
    baseWrapper.id = "base__wrapper";
    while (document.body.children.length > 0) {
      baseWrapper.appendChild(document.body.children[0]);
    }
    document.body.appendChild(baseWrapper);

    return () => {
      document.body.removeAttribute("data-widget-theme");
      document.body.removeAttribute("data-widget-position");
      while (baseWrapper.children.length > 0) {
        document.body.appendChild(baseWrapper.children[0]);
      }
      baseWrapper.remove();
    };
  }, [theme, position]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      setIsLoading(true);
      setError(null);
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
  }, [isOpen, userId, token]);

  const togglePanel = () => {
    setIsOpen((prev) => !prev);
    const baseWrapper = document.getElementById("base__wrapper");
    const sidePanel = document.getElementById("now__sidepanel");

    if (baseWrapper && sidePanel) {
      if (!isOpen) {
        sidePanel.style.left = "0";
        if (window.innerWidth > 768) {
          baseWrapper.style.transform = "translateX(50%)";
        }
      } else {
        sidePanel.style.left = window.innerWidth > 768 ? "-50%" : "-100%";
        baseWrapper.style.transform = "translateX(0)";
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
          {isOpen && !isLoading && !error && (
            <Suspense fallback={<div>Loading...</div>}>
              <SidePanelContent
                userId={userId}
                token={token}
                posts={posts}
                user={user}
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default NowWidget;
