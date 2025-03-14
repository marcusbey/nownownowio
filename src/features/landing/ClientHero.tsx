'use client';

import { Button } from "@/components/core/button";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";
import { HeroContent } from "./HeroContent";
import { WidgetPreview } from "./WidgetPreview";

type ClientHeroProps = {
  children?: ReactNode;
}

export function ClientHero({ children }: ClientHeroProps) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-transparent to-slate-900/90" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute -left-40 -top-40 size-80 animate-pulse rounded-full bg-purple-500 opacity-20 blur-3xl" />
      <div className="absolute -bottom-40 right-0 size-80 animate-pulse rounded-full bg-indigo-500 opacity-20 blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col">
        {/* Upper Section: Tagline and Auth */}
        <div className="flex w-full flex-col items-start justify-between gap-6 px-6 py-12 lg:flex-row">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-left lg:max-w-xl"
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
              <span className="mb-2 block">Show Your Progress</span>
              <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Build Trust Instantly
              </span>
            </h1>
            <p className="mb-8 max-w-lg text-lg leading-8 text-gray-300">
              Let your customers see you're working on their needs in real-time. 
              Companies using NowNowNow see up to 
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text font-semibold text-transparent"> 3x more engagement </span>
              from their audience.
            </p>

            {/* Social Proof Metrics */}
            <div className="grid max-w-lg grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="space-y-1">
                <div className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-bold text-transparent">
                  47%
                </div>
                <div className="text-sm text-gray-400">
                  Faster Project<br />Delivery
                </div>
              </div>
              <div className="space-y-1">
                <div className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
                  3x
                </div>
                <div className="text-sm text-gray-400">
                  More Social<br />Shares
                </div>
              </div>
              <div className="space-y-1">
                <div className="bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-2xl font-bold text-transparent">
                  89%
                </div>
                <div className="text-sm text-gray-400">
                  Higher Customer<br />Trust
                </div>
              </div>
            </div>
          </motion.div>

          {/* Auth Section */}
          <div className="w-full lg:w-[440px] lg:min-w-[440px] lg:max-w-[440px]">
            {children}
          </div>
        </div>

        {/* Lower Section: Widget Preview */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12">
          <div className="relative w-full">
            {/* Glow Effect Container */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/2 size-[800px] -translate-x-1/2 -translate-y-1/2">
                {/* Primary large glow */}
                <div className="absolute inset-0 rounded-full bg-purple-600/70 mix-blend-multiply blur-[120px]" />
                {/* Secondary intense glow */}
                <div className="absolute inset-0 rounded-full bg-violet-500/60 mix-blend-multiply blur-[80px]" />
                {/* Core bright glow */}
                <div className="absolute inset-0 scale-75 rounded-full bg-fuchsia-400/50 mix-blend-multiply blur-[60px]" />
              </div>
            </div>

            {/* Preview Container */}
            <div className="relative z-10 w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="w-full"
              >
                <WidgetPreview className="w-full shadow-2xl" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
