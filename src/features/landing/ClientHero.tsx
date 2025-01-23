'use client';

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { ReactNode } from "react";
import { WidgetPreview } from "./WidgetPreview";

interface ClientHeroProps {
  children?: ReactNode;
}

export function ClientHero({ children }: ClientHeroProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-transparent to-slate-900/90" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-purple-500 opacity-20 blur-3xl" />
      <div className="absolute -bottom-40 right-0 h-80 w-80 animate-pulse rounded-full bg-indigo-500 opacity-20 blur-3xl" />

      {/* Main Content */}
      <div className="relative z-10 flex flex-1 flex-col max-w-7xl mx-auto w-full">
        {/* Upper Section: Tagline and Auth */}
        <div className="flex flex-col lg:flex-row items-start justify-between px-6 py-12 w-full gap-8">
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-left lg:max-w-2xl"
          >
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-4">
              Share Your Journey
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                Build Trust in Real-Time
              </span>
            </h1>
            <p className="text-lg leading-8 text-gray-300">
              Transform visitors into loyal customers by sharing your progress as it happens.
              Create authentic connections and watch your conversion rates soar.
            </p>
          </motion.div>

          {/* Auth Section - Keep Original */}
          <div className="w-full lg:w-[400px] lg:min-w-[400px] lg:max-w-[400px]">
            {children}
          </div>
        </div>

        {/* Lower Section: Widget Preview */}
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="w-full"
          >
            <WidgetPreview className="shadow-2xl" />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
