"use client";

import { Button } from "@/components/core/button";
import { alertDialog } from "@/features/ui/alert-dialog/alert-dialog-store";
import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { organizationDeleteAction } from "./delete-org.action";

export const OrganizationDeleteDialog = ({
  org,
}: {
  org: { id: string; slug: string };
}) => {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async () => {
      const result = await organizationDeleteAction({ orgSlug: org.slug });

      if (result.serverError) {
        toast.error(result.serverError);
        return;
      }

      toast.success("Organization deleted");
      router.push("/orgs");
      router.refresh();
    },
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
      onClick={() => {
        alertDialog.add({
          title: "Delete Organization",
          description: "Are you sure you want to delete your organization?",
          confirmText: org.slug,
          action: {
            label: "Delete",
            onClick: async () => {
              await mutation.mutateAsync();
            },
          },
        });
      }}
    >
      <Trash2 className="mr-2" size={16} />
      Delete Organization
    </Button>
  );
};
