"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

interface SearchParamsMessageToastProps {
  messageKey?: string;
  errorKey?: string;
}

export function SearchParamsMessageToastSuspended({
  messageKey = "message",
  errorKey = "error",
}: SearchParamsMessageToastProps) {
  const searchParams = useSearchParams();
  const message = searchParams.get(messageKey);
  const error = searchParams.get(errorKey);

  useEffect(() => {
    if (message) {
      toast.success(message);
    }
    if (error) {
      toast.error(error);
    }
  }, [message, error]);

  return null;
}
