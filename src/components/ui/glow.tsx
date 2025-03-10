import React from "react";
import { cn } from "@/lib/utils";
import { VariantProps, cva } from "class-variance-authority";

const glowVariants = cva(
  "pointer-events-none absolute -z-10 opacity-75 mix-blend-screen",
  {
    variants: {
      position: {
        top: "-top-[20%] left-1/2 -translate-x-1/2",
        center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        "top-right": "-top-[20%] -right-[20%]",
        "top-left": "-top-[20%] -left-[20%]",
      },
      size: {
        sm: "h-[300px] w-[300px] blur-[60px]",
        md: "h-[500px] w-[500px] blur-[80px]",
        lg: "h-[800px] w-[800px] blur-[100px]",
        xl: "h-[1000px] w-[1000px] blur-[120px]"
      }
    },
    defaultVariants: {
      position: "center",
      size: "lg"
    },
  }
);

interface GlowProps extends VariantProps<typeof glowVariants> {
  className?: string;
  color?: string;
}

const Glow = React.forwardRef<HTMLDivElement, GlowProps>(
  ({ position, size, className, color, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(glowVariants({ position, size }), className)}
      style={{
        background: color || 
          "radial-gradient(50% 50% at 50% 50%, rgba(147, 51, 234, 0.7) 0%, rgba(139, 92, 246, 0.3) 50%, rgba(167, 139, 250, 0.1) 100%)",
      }}
      {...props}
    />
  )
);

Glow.displayName = "Glow";

export { Glow };
