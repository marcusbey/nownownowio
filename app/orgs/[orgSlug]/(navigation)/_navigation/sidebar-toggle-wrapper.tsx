"use client";

import { useEffect, useState, type ReactNode } from "react";

type SidebarToggleWrapperProps = {
  children: [ReactNode, ReactNode, ReactNode]; // Expect exactly 3 children
};

export function SidebarToggleWrapper({ children }: SidebarToggleWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Function to handle sidebar toggle
    const handleSidebarToggle = () => {
      setSidebarOpen((prev) => !prev);
    };

    // Get the toggle button
    const toggleButton = document.querySelector('[data-sidebar="trigger"]');
    const railButton = document.querySelector('[data-sidebar="rail"]');

    // Add event listeners
    if (toggleButton) {
      toggleButton.addEventListener("click", handleSidebarToggle);
    }

    // Cleanup on unmount
    return () => {
      if (toggleButton) {
        toggleButton.removeEventListener("click", handleSidebarToggle);
      }
    };
  }, []);

  return (
    <div className="mx-auto flex h-dvh w-full max-w-screen-2xl">
      {/* Left Sidebar - Apply classes based on state */}
      <div
        className={`relative h-full overflow-y-auto transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-1/4 min-w-[250px]" : "w-0 min-w-0 opacity-0"
        }`}
      >
        {children[0]}
      </div>

      {/* Main Content Area - Fills the space between sidebars */}
      <div className="flex-1 h-full overflow-hidden">
        {children[1]}
      </div>

      {/* Right Sidebar */}
      <div className="h-full w-1/4 min-w-[250px] overflow-y-auto">
        {children[2]}
      </div>
    </div>
  );
}
