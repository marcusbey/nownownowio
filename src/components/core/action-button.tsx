import { Button } from "@/components/core/button";
import { cn } from "@/lib/utils";
import { type ComponentProps } from "react";

type ActionButtonProps = {
  variant?: "primary" | "secondary";
  size?: "default" | "sm" | "lg";
} & Omit<ComponentProps<typeof Button>, "variant" | "size">;

export function ActionButton({
  variant = "primary",
  size = "default",
  className,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant={variant === "primary" ? "default" : "secondary"}
      size={size}
      className={cn(
        "font-semibold transition-transform active:scale-95",
        "bg-blue-600 hover:bg-blue-700",
        "dark:bg-blue-500 dark:hover:bg-blue-600",
        className,
      )}
      {...props}
    />
  );
}
