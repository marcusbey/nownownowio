"use client";

import { Post, User } from "@/lib/types";
import React, { Suspense, useEffect, useRef, useState } from "react";
import { createRoot, Root } from "react-dom/client";
import NowButton from "./NowButton";
import "./NowWidgetStyle.css";

interface WidgetConfig {
  userId: string;
  token: string;
  theme?: "light" | "dark";
  position?: "left" | "right";
  buttonColor?: string;
  buttonSize?: number;
  // Optional pathname prop for testing purposes
  pathname?: string;
}

const SidePanelContent = React.lazy(() => import("./SidePanelContent"));

const NowWidget: React.FC<WidgetConfig> = ({
  userId,
  token,
  theme = "light",
  position = "left",
  buttonColor = "red",
  buttonSize = 150,
  pathname: propPathname, // Optional prop
}) => {
  // Determine pathname: use prop if provided, else use window.location.pathname
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
  const sidePanelRootRef = useRef<Root | null>(null);

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
    // if (pathname !== "/") return;

    const initializeWidget = () => {
      // Inject custom styles
      const style = document.createElement("style");
      style.innerHTML = `
        /* Styles for NowWidget */
        #now__sidepanel {
          height: 100vh;
          width: 30%;
          position: fixed;
          z-index: 1000;
          top: 0;
          left: -30%;
          background-color: #111;
          overflow-x: hidden;
          transition: right 0.5s cubic-bezier(0.77, 0.2, 0.05, 1.0);
          padding-top: 60px;
        }
        #now__sidepanel.open {
          left: 0;
        }
        #now__sidepanel a {
          padding: 8px 8px 8px 32px;
          text-decoration: none;
          font-size: 25px;
          color: #818181;
          display: block;
          transition: 0.3s;
        }
        #now__sidepanel a:hover {
          color: #f1f1f1;
        }
        .closebtn {
          position: absolute;
          top: 20px;
          right: 25px;
          font-size: 36px;
          cursor: pointer;
          color: #818181;
          transition: color 0.3s;
        }
        .closebtn:hover {
          color: #f1f1f1;
        }
        #now-widget-basewrapper {
          transition: transform 0.5s cubic-bezier(0.77, 0.2, 0.05, 1.0);
          width: 100%;
        }
        #now-button-container {
          position: fixed;
          right: 20%;
          bottom: 20%;
          z-index: 999;
        }
        @media screen and (max-width: 768px) {
          #now__sidepanel {
            width: 100%;
            left: -100%;
          }
          #now-widget-basewrapper {
            transform: none !important;
          }
          #now-button-container {
            right: 10%;
            bottom: 10%;
          }
        }
      `;
      document.head.appendChild(style);

      // Create side panel
      const sideNav = document.createElement("div");
      sideNav.id = "now__sidepanel";
      sideNav.innerHTML = `
        <span class="closebtn">&times;</span>
        <div id="now-sidepanel-content"></div>
      `;
      document.body.insertBefore(sideNav, document.body.firstChild);

      // Create base wrapper
      const baseWrapper = document.createElement("div");
      baseWrapper.id = "now-widget-basewrapper";
      while (document.body.children.length > 1) {
        baseWrapper.appendChild(document.body.children[1]);
      }
      document.body.appendChild(baseWrapper);

      // Create container for NowButton
      const nowButtonContainer = document.createElement("div");
      nowButtonContainer.id = "now-button-container";
      document.body.appendChild(nowButtonContainer);

      // Render NowButton
      nowButtonRootRef.current = createRoot(nowButtonContainer);
      nowButtonRootRef.current.render(
        <NowButton
          onClick={() => setIsOpen(true)}
          size={buttonSize}
          color={buttonColor}
          backgroundColor="transparent"
          updated={posts.length > 0}
        />,
      );

      // Render SidePanelContent
      const sidepanelContentDiv = sideNav.querySelector(
        "#now-sidepanel-content",
      );
      if (sidepanelContentDiv) {
        sidePanelRootRef.current = createRoot(sidepanelContentDiv);
        sidePanelRootRef.current.render(
          <>
            {isLoading && <p>Loading...</p>}
            {error && <p className="now-widget-error">Error: {error}</p>}
            {!isLoading && !error && (
              <Suspense fallback={<div>Loading...</div>}>
                <SidePanelContent
                  userId={userId}
                  token={token}
                  posts={posts}
                  user={user}
                />
              </Suspense>
            )}
          </>,
        );
      }

      // Event listeners for closing the panel
      const closeBtn = sideNav.querySelector(".closebtn");
      closeBtn?.addEventListener("click", () => setIsOpen(false));

      // Close panel when clicking outside
      baseWrapper.addEventListener("click", () => {
        if (isOpen) {
          setIsOpen(false);
        }
      });

      // Prevent clicks inside the side panel from closing it
      sideNav.addEventListener("click", (e) => {
        e.stopPropagation();
      });

      // Animation handler
      const animatePanel = () => {
        requestAnimationFrame(() => {
          if (isOpen) {
            sideNav.classList.add("open");
            baseWrapper.style.transform = "translateX(30%)";
          } else {
            sideNav.classList.remove("open");
            baseWrapper.style.transform = "translateX(0)";
          }
        });
      };

      animatePanel();
    };

    initializeWidget();

    return () => {
      // Cleanup function
      const sideNav = document.getElementById("now__sidepanel");
      const baseWrapper = document.getElementById("now-widget-basewrapper");
      const style = document.querySelector("style");
      const nowButtonContainer = document.getElementById(
        "now-button-container",
      );

      if (sideNav) sideNav.remove();
      if (baseWrapper) {
        while (baseWrapper.firstChild) {
          document.body.appendChild(baseWrapper.firstChild);
        }
        baseWrapper.remove();
      }
      if (style) style.remove();
      if (nowButtonContainer) {
        nowButtonRootRef.current?.unmount();
        nowButtonContainer.remove();
      }

      // Unmount SidePanelContent
      if (sidePanelRootRef.current) {
        sidePanelRootRef.current.unmount();
      }
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
  ]);

  // Trigger animation when isOpen changes
  useEffect(() => {
    // if (pathname !== "/") return;
    const animatePanel = () => {
      requestAnimationFrame(() => {
        const sideNav = document.getElementById("now__sidepanel");
        const baseWrapper = document.getElementById("now-widget-basewrapper");
        if (sideNav && baseWrapper) {
          if (isOpen) {
            sideNav.classList.add("open");
            baseWrapper.style.transform = "translateX(30%)";
          } else {
            sideNav.classList.remove("open");
            baseWrapper.style.transform = "translateX(0)";
          }
        }
      });
    };
    animatePanel();
  }, [isOpen, pathname]);

  // if (pathname !== "/") return null;

  return null;
};

export default NowWidget;
