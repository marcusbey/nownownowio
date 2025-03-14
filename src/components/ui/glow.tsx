import React from "react";
import { cn } from "@/lib/utils";
import type { VariantProps} from "class-variance-authority";
import { cva } from "class-variance-authority";

const glowVariants = cva(
  "pointer-events-none absolute -z-10 opacity-75 mix-blend-screen",
  {
    variants: {
      position: {
        top: "-top-[20%] left-1/2 -translate-x-1/2",
        center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        "top-right": "-right-[20%] -top-[20%]",
        "top-left": "-left-[20%] -top-[20%]",
      },
      size: {
        sm: "size-[300px] blur-[60px]",
        md: "size-[500px] blur-[80px]",
        lg: "size-[800px] blur-[100px]",
        xl: "size-[1000px] blur-[120px]"
      }
    },
    defaultVariants: {
      position: "center",
      size: "lg"
    },
  }
);

type GlowProps = {
  className?: string;
  color?: string;
} & VariantProps<typeof glowVariants>

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
