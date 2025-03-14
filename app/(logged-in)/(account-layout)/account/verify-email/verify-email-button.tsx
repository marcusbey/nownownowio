"use client";

import type { ButtonProps } from "@/components/core/button";
import { LoadingButton } from "@/features/ui/form/submit-button";
import { useMutation } from "@tanstack/react-query";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { createVerifyEmailAction } from "./verify-email.action";

export const VerifyEmailButton = (props: Omit<ButtonProps, 'onClick'> & { variant?: string }) => {
  const mutation = useMutation({
    mutationFn: async () => {
      const result = await createVerifyEmailAction();

      if (result?.serverError) {
        toast.error(result.serverError ?? "An error occurred");
        return;
      }

      toast.success("Email sent");
    },
  });

  return (
    <LoadingButton
      loading={mutation.isPending}
      variant={props.variant ?? "secondary"}
      size="sm"
      onClick={() => { mutation.mutate(); }}
      {...props}
    >
      {mutation.isError ? <X size={16} className="mr-2" /> : null}
      {mutation.isSuccess ? <Check size={16} className="mr-2" /> : null}
      Verify Email
    </LoadingButton>
  );
};
