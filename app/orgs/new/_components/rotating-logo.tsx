"use client";

import { LogoSvg } from "@/components/icons/logo-svg";

export function RotatingLogo() {
  return (
    <div className="absolute -right-32 bottom-0 z-0 translate-y-1/3">
      <div className="relative flex size-[400px] animate-pulse items-center justify-center overflow-hidden rounded-full bg-black">
        <div className="absolute animate-spin-slow">
          <LogoSvg size={600} className="opacity-30" />
        </div>
      </div>
    </div>
  );
}
