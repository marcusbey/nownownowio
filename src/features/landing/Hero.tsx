import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { ClientHero } from "./ClientHero";
import { AuthCheck } from "./AuthCheck";

// Server Component for initial render
export function Hero() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-900">
      <Suspense fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="size-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      }>
        <ClientHero>
          <AuthCheck />
        </ClientHero>
      </Suspense>
    </div>
  );
}
