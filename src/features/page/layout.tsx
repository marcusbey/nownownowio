import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
  className?: string;
};

export function Layout({ children, className }: LayoutProps) {
  return (
    <div className={cn("flex-1 px-4 py-8", className)}>
      {children}
    </div>
  );
}

export function LayoutHeader({ children, className }: LayoutProps) {
  return <div className={cn("mb-8 space-y-2", className)}>{children}</div>;
}

export function LayoutTitle({ children, className }: LayoutProps) {
  return <h1 className={cn("text-3xl font-bold", className)}>{children}</h1>;
}

export function LayoutDescription({ children, className }: LayoutProps) {
  return <p className={cn("text-muted-foreground", className)}>{children}</p>;
}

export function LayoutContent({ children, className }: LayoutProps) {
  return <div className={cn("space-y-6", className)}>{children}</div>;
}

export function LayoutActions({ children, className }: LayoutProps) {
  return (
    <div className={cn("flex items-center gap-4", className)}>{children}</div>
  );
}
