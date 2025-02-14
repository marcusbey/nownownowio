"use client";

import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { type ComponentPropsWithoutRef } from "react";

interface VisuallyHiddenProps extends ComponentPropsWithoutRef<"span"> {
  asChild?: boolean;
}

export function VisuallyHidden({
  asChild,
  className,
  ...props
}: VisuallyHiddenProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      {...props}
      className={cn(
        "absolute left-[-9999px] top-[-9999px] z-[-1] h-[1px] w-[1px] overflow-hidden whitespace-nowrap",
        className,
      )}
    />
  );
}
