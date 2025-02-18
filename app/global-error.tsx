"use client";

import { HeaderBase } from "@/features/core/header-base";
import { Page400 } from "@/features/core/page-400";

export default function ErrorPage() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <HeaderBase />
      <div className="flex flex-1 items-center justify-center">
        <Page400 />
      </div>
    </div>
  );
}
