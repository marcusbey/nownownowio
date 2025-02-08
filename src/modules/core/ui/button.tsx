import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/20 hover:bg-destructive/90 hover:shadow-xl hover:shadow-destructive/30 active:scale-[0.98]",
        outline:
          "border-2 border-input bg-background hover:bg-accent/50 hover:text-accent-foreground hover:border-accent active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-lg shadow-secondary/10 hover:bg-secondary/80 hover:shadow-xl hover:shadow-secondary/20 active:scale-[0.98]",
        ghost: "hover:bg-accent/50 hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
        invert: "bg-foreground text-background shadow-lg hover:bg-foreground/90 hover:shadow-xl active:scale-[0.98]",
        success: "bg-success text-success-foreground shadow-lg shadow-success/20 hover:bg-success/90 hover:shadow-xl hover:shadow-success/30 active:scale-[0.98]",
        warning: "bg-warning text-warning-foreground shadow-lg shadow-warning/20 hover:bg-warning/90 hover:shadow-xl hover:shadow-warning/30 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = {
  asChild?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
