"use client";

import { Post, User } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { Root } from "react-dom/client";
import "./nowWidgetStyle.css"; // Updated stylesheet
import { animatePanel, cleanupWidget, initializeWidget } from "./widgetUtils";

interface WidgetConfig {
  userId: string;
  token: string;
  theme?: "light" | "dark";
  position?: "left" | "right";
  buttonColor?: string;
  buttonSize?: number;
  pathname?: string; // Optional pathname prop for testing purposes
}

const NowPanelContent = React.lazy(() => import("./NowPanelContent"));

const NowWidget: React.FC<WidgetConfig> = ({
  userId,
  token,
  theme = "light",
  position = "left",
  buttonColor = "red",
  buttonSize = 150,
  pathname: propPathname,
}) => {
  const [pathname, setPathname] = useState<string>(
    propPathname || window.location.pathname,
  );

  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs to store root instances
  const nowButtonRootRef = useRef<Root | null>(null);
  const nowPanelRootRef = useRef<Root | null>(null);

  // Fetch Data Effect
  useEffect(() => {
    if (pathname !== "/") return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const API_BASE_URL =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

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

        const data = await response.json();

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
  }, [pathname, userId, token]);

  // Initialize Widget Effect
  useEffect(() => {
    initializeWidget({
      setIsOpen,
      theme,
      position,
      buttonColor,
      buttonSize,
      posts,
      user,
      isLoading,
      error,
    });

    return () => {
      cleanupWidget({
        nowButtonRootRef,
        nowPanelRootRef,
      });
    };
  }, [
    pathname,
    isOpen,
    buttonColor,
    buttonSize,
    posts,
    userId,
    token,
    isLoading,
    error,
    user,
    theme,
    position,
  ]);

  // Trigger animation when isOpen changes
  useEffect(() => {
    animatePanel(isOpen, position);
  }, [isOpen, position]);

  return null;
};

export default NowWidget;
