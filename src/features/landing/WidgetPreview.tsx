'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Glow } from '@/components/ui/glow';

interface Post {
  id: number;
  title: string;
  date: string;
  content: string;
}

const dummyPosts: readonly Post[] = [
  {
    id: 1,
    title: "Policy Update",
    date: "2 hours ago",
    content: "New home insurance benefits added: Extended water damage coverage now included in all premium plans."
  },
  {
    id: 2,
    title: "Claims Process Simplified",
    date: "Yesterday",
    content: "File claims directly through our mobile app. Most claims now processed within 24 hours."
  },
  {
    id: 3,
    title: "Customer Notice",
    date: "3 days ago",
    content: "Hurricane season preparation guide now available. Download it to ensure your property is protected."
  }
] as const;

interface WidgetPreviewProps {
  className?: string;
}

export function WidgetPreview({ className }: WidgetPreviewProps): JSX.Element {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  if (!isMounted) return <></>;

  return (
    <div className={cn("relative w-full overflow-hidden rounded-lg bg-background/5 backdrop-blur-sm", className)}>
      <Glow />
      
      {/* Main Content Preview */}
      <motion.div
        className="relative bg-white/90 backdrop-blur-md p-8 rounded-lg border border-slate-200/50 shadow-2xl"
        animate={{
          x: isOpen 
            ? 'min(400px, 80%)' 
            : '0%'
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30
        }}
      >
        {/* Overlay when panel is open */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm z-10"
            />
          )}
        </AnimatePresence>

        {/* Navigation Bar */}
        <div className="flex items-center justify-between mb-12 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500" />
            <span className="font-semibold text-xl text-slate-900">Guardian Shield</span>
          </div>
          <div className="hidden sm:flex gap-8 text-sm">
            <span className="text-slate-600 hover:text-slate-900 cursor-pointer">Coverage</span>
            <span className="text-slate-600 hover:text-slate-900 cursor-pointer">Claims</span>
            <span className="text-slate-600 hover:text-slate-900 cursor-pointer">Support</span>
          </div>
        </div>

        {/* Hero Section */}
        <div className="space-y-16 max-w-7xl mx-auto">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">
              Protect What
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
                Matters Most
              </span>
            </h1>
            <p className="text-lg text-slate-600 max-w-lg">
              Comprehensive coverage for your life's journey. Simple, transparent, and always there when you need us.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                title: "Home",
                desc: "Complete protection for your property"
              },
              {
                title: "Auto",
                desc: "Coverage that moves with you"
              },
              {
                title: "Life",
                desc: "Securing your family's future"
              }
            ].map((feature, i) => (
              <div key={i} className="p-6 rounded-xl bg-slate-50 space-y-3 border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 py-8">
            {[
              { value: "A+", label: "Rating" },
              { value: "24/7", label: "Support" },
              { value: "1M+", label: "Customers" },
              { value: "98%", label: "Satisfaction" }
            ].map((stat, i) => (
              <div key={i} className="text-center space-y-2">
                <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                <div className="text-sm text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed Position Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "fixed bottom-8 left-8 h-16 w-16 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900",
            "shadow-lg hover:shadow-xl transition-all duration-200",
            "border-2 border-amber-500/20"
          )}
        >
          {isOpen ? <ChevronLeft className="h-8 w-8" /> : <ChevronRight className="h-8 w-8" />}
        </Button>
      </motion.div>

      {/* Sliding Panel */}
      <AnimatePresence>
        <motion.div
          className={cn(
            "absolute top-0 left-0 h-full bg-slate-900 backdrop-blur-sm border-r border-slate-800",
            "w-[min(400px,80%)]"
          )}
          initial={{ x: '-100%' }}
          animate={{
            x: isOpen ? '0%' : '-100%'
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30
          }}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <h4 className="font-semibold text-slate-200">Latest Updates</h4>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Panel Content */}
          <div className="p-4 space-y-4">
            {dummyPosts.map((post) => (
              <div 
                key={post.id} 
                className="p-3 rounded-lg bg-slate-800/50 space-y-2 transition-colors hover:bg-slate-800 cursor-pointer"
              >
                <div className="flex justify-between items-start">
                  <h5 className="font-medium text-sm text-slate-200">{post.title}</h5>
                  <span className="text-xs text-slate-400">{post.date}</span>
                </div>
                <p className="text-sm text-slate-400">{post.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
