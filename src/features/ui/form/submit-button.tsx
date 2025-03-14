"use client";

import { Button } from "@/components/core/button";
import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "invert"
    | "success"
    | "warning";
  loading?: boolean;
  type?: "submit" | "button" | "reset";
  onClick?: () => void | Promise<void>;
  disabled?: boolean;
};

export function SubmitButton({
  children,
  className,
  variant = "default",
  loading,
  type = "submit",
  onClick,
  disabled,
}: SubmitButtonProps) {
  const { pending: formPending } = useFormStatus();
  const isPending = loading ?? formPending;

  return (
    <Button
      type={type}
      className={className}
      variant={variant}
      onClick={onClick}
      disabled={disabled ?? isPending}
    >
      {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children}
    </Button>
  );
}

export { SubmitButton as LoadingButton };
