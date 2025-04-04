import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

type FormUnsavedBarProps = {
  className?: string;
}

export function FormUnsavedBar({ className }: FormUnsavedBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md bg-yellow-100 p-2 text-sm text-yellow-800",
        className
      )}
    >
      <AlertTriangle className="size-4" />
      <span>You have unsaved changes</span>
    </div>
  );
}
