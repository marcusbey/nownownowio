import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { ButtonProps } from "@/components/core/button";
import { Button } from "@/components/core/button";

type LoadingButtonProps = {
  loading: boolean;
} & ButtonProps

export default function LoadingButton({
  loading,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("flex items-center gap-2", className)}
      {...props}
    >
      {loading && <Loader2 className="size-5 animate-spin" />}
      {props.children}
    </Button>
  );
}
