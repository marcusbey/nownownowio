'use client';

import { Button } from "@/components/core/button";
import { motion } from "framer-motion";
import Link from "next/link";

export function HeroContent() {
  return (
    <>
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-transparent to-slate-900/90" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute -left-40 -top-40 h-80 w-80 animate-pulse rounded-full bg-purple-500 opacity-20 blur-3xl" />
      <div className="absolute -bottom-40 right-0 h-80 w-80 animate-pulse rounded-full bg-indigo-500 opacity-20 blur-3xl" />

      <div className="container relative mx-auto grid min-h-screen grid-cols-1 gap-8 px-4 py-20 lg:grid-cols-2 lg:px-6">
        {/* Left Side - Content */}
        <div className="flex flex-col justify-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span className="block">
                Connect, Share, and
              </span>
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Grow Together
              </span>
            </h1>
            <p className="max-w-xl text-xl text-slate-300">
              The modern social platform where organizations thrive. Create your space, connect with your team, and build something amazing.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-wrap gap-4"
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-indigo-500 to-cyan-500 text-lg hover:from-indigo-600 hover:to-cyan-600"
            >
              <Link href="/auth/signup">Start Your Journey</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-slate-700 bg-transparent text-lg text-white hover:bg-slate-800"
            >
              <Link href="#features">Learn More</Link>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 border-t border-slate-800 pt-8"
          >
            {[
              ["1M+", "Active Users"],
              ["10K+", "Organizations"],
              ["24/7", "Support"],
            ].map(([stat, label]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{stat}</div>
                <div className="text-sm text-slate-400">{label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side Slot */}
        <div className="flex items-center justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/50 p-8 backdrop-blur-xl"
          >
            {/* Auth content will be passed as children */}
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="text-sm text-slate-400">Scroll to explore</span>
          <div className="h-12 w-6 rounded-full border-2 border-slate-700 p-1">
            <div className="h-2 w-full animate-bounce rounded-full bg-slate-400" />
          </div>
        </div>
      </motion.div>
    </>
  );
}
