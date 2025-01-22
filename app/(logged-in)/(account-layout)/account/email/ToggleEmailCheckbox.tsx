"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { toggleSubscribedAction } from "./mail-account.action";

type ToggleEmailCheckboxProps = {
  subscribed: boolean;
};

export const ToggleEmailCheckbox = ({
  subscribed,
}: ToggleEmailCheckboxProps) => {
  const mutation = useMutation({
    mutationFn: async (subscribed: boolean) => {
      const result = await toggleSubscribedAction({
        subscribed,
      });

      if (!result?.data) {
        toast.error(result?.serverError ?? "An error occurred");
        return;
      }

      toast.success("You've updated your email settings.");
    },
  });

  return (
    <div
      className={cn(
        "flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4",
        {
          "bg-muted": mutation.isPending,
        },
      )}
    >
      <Checkbox
        id="subscribed-checkbox"
        defaultChecked={subscribed}
        disabled={mutation.isPending}
        onCheckedChange={(checked) => {
          const newChecked = Boolean(checked);

          mutation.mutate(newChecked);
        }}
      />
      <div className="space-y-1 leading-none">
        <Label htmlFor="subscribed-checkbox">Subscribed</Label>
        <Typography variant="muted">
          If enabled, you will receive marketing or promotional emails from us.
        </Typography>
      </div>
    </div>
  );
};
