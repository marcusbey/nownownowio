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
    | "link";
};

export function SubmitButton({
  children,
  className,
  variant = "default",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={className}
      variant={variant}
      disabled={pending}
    >
      {pending && <Loader2 className="mr-2 size-4 animate-spin" />}
      {children}
    </Button>
  );
}

export { SubmitButton as LoadingButton };
