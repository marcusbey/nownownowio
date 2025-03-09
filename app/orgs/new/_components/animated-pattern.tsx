"use client";

import { motion } from "framer-motion";

interface AnimatedPatternProps {
  className?: string;
}

export function AnimatedPattern({ className }: AnimatedPatternProps) {
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5" />
      
      {/* Animated circles */}
      <motion.div 
        className="absolute top-1/4 left-1/4 h-24 w-24 rounded-full bg-primary/20"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 20, 0],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div 
        className="absolute top-2/3 right-1/3 h-32 w-32 rounded-full bg-primary/15"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Floating dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-primary/30"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, Math.random() * 30 - 15],
            x: [0, Math.random() * 30 - 15],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 2,
          }}
        />
      ))}
      
      {/* Animated lines */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <motion.path
          d="M0,100 Q150,50 300,100 T600,100"
          fill="none"
          stroke="rgba(var(--primary), 0.2)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: 0.5,
            pathOffset: [0, 1]
          }}
          transition={{ 
            duration: 15, 
            repeat: Infinity,
            ease: "linear" 
          }}
        />
        <motion.path
          d="M0,200 Q200,150 400,200 T800,200"
          fill="none"
          stroke="rgba(var(--primary), 0.15)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ 
            pathLength: 1, 
            opacity: 0.4,
            pathOffset: [0, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity,
            ease: "linear",
            delay: 1
          }}
        />
      </svg>
      
      {/* Animated gradient overlay */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-primary/5 to-transparent"
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
