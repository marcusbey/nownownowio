import { cn } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

interface FormUnsavedBarProps {
  className?: string;
}

export default function FormUnsavedBar({ className }: FormUnsavedBarProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md bg-yellow-100 p-2 text-sm text-yellow-800",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4" />
      <span>You have unsaved changes</span>
    </div>
  );
}
