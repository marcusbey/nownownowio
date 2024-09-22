import React, { lazy, Suspense, useCallback, useEffect, useState } from "react";
import NowButton from "./NowButton";
import "./NowWidgetStyle.css";

const SidePanelContent = lazy(() => import("./SidePanelContent"));

interface Post {
  id: string;
  content: string;
  createdAt: string;
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
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchPosts = useCallback(async () => {
    if (!isOpen) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/widget/posts?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setIsLoading(false);
    }
  }, [isOpen, userId, token]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

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
          {isOpen && (
            <Suspense fallback={<div>Loading...</div>}>
              <SidePanelContent posts={posts} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
};

export default NowWidget;
