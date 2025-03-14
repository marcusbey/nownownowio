"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const logos = [
  { src: "/logos/logo1.png", alt: "Company 1" },
  { src: "/logos/logo2.png", alt: "Company 2" },
  { src: "/logos/logo3.png", alt: "Company 3" },
  { src: "/logos/logo4.png", alt: "Company 4" },
  { src: "/logos/logo5.png", alt: "Company 5" },
  { src: "/logos/logo6.png", alt: "Company 6" },
];

export function LogoCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % (logos.length * 2));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full overflow-hidden bg-background/50 py-12 backdrop-blur-sm">
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-base font-semibold leading-7 text-primary">
            Trusted by innovative teams
          </p>
        </div>
        <div className="relative mt-10">
          <div
            className="animate-scroll flex items-center justify-center gap-8 transition-transform duration-1000"
            style={{
              transform: `translateX(-${scrollPosition * 100}px)`,
            }}
          >
            {[...logos, ...logos].map((logo, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative h-16 w-32 shrink-0 grayscale transition-all hover:grayscale-0",
                )}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
