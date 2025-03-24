"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

type BannerImageProps = {
  imageUrl?: string | null;
  alt?: string;
  className?: string;
  height?: string | number;
  fallbackClassName?: string;
};

export default function BannerImage({
  imageUrl,
  alt = "Banner image",
  className,
  height = "h-64",
  fallbackClassName,
}: BannerImageProps) {
  const [error, setError] = useState(false);

  // If no image or error loading image, show default gradient background
  if (!imageUrl || error) {
    return (
      <div
        className={cn(
          "w-full overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50",
          height,
          fallbackClassName,
          className,
        )}
      >
        <svg
          className="size-full"
          viewBox="0 0 1000 200"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,100 C150,150 350,0 500,100 C650,200 850,50 1000,100 L1000,200 L0,200 Z"
            fill="currentColor"
            className="text-orange-200/30"
          />
          <path
            d="M0,100 C200,150 300,50 500,100 C700,150 800,50 1000,100 L1000,200 L0,200 Z"
            fill="currentColor"
            className="text-orange-300/20"
          />
        </svg>
      </div>
    );
  }

  // Show actual banner image
  return (
    <div className={cn("relative w-full overflow-hidden", height, className)}>
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={alt}
          className="size-full object-cover"
          onError={() => setError(true)}
        />
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
    </div>
  );
}
