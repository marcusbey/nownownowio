"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useZodForm,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { alertDialog } from "@/features/ui/alert-dialog/alert-dialog-store";
import { FormUnsavedBar } from "@/features/ui/form/form-unsaved-bar";
import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { formatId } from "@/lib/format/id";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrganizationDetailsAction } from "../org.action";
import { OrgDangerFormSchema, OrgDangerFormSchemaType } from "../org.schema";
type ProductFormProps = {
  defaultValues: OrgDangerFormSchemaType;
};

export const OrganizationDangerForm = ({ defaultValues }: ProductFormProps) => {
  const form = useZodForm({
    schema: OrgDangerFormSchema,
    defaultValues,
  });
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: OrgDangerFormSchemaType) => {
      const result = await updateOrganizationDetailsAction(values);

      if (!isActionSuccessful(result)) {
        toast.error(result?.serverError ?? "Failed to invite user");
        return;
      }

      const newUrl = window.location.href.replace(
        `/orgs/${defaultValues.slug}/`,
        `/orgs/${result.data.slug}/`,
      );
      router.push(newUrl);
      form.reset(result.data as OrgDangerFormSchemaType);
    },
  });

  return (
    <FormUnsavedBar
      form={form}
      onSubmit={(v) => {
        alertDialog.add({
          title: "Are you sure?",
          description:
            "You are about to change the unique identifier of your organization. All the previous URLs will be changed.",
          action: {
            label: "Yes, change the slug",
            onClick: () => {
              mutation.mutate(v);
            },
          },
        });
      }}
      className="flex w-full flex-col gap-4"
    >
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Enter new organization slug"
                  className="max-w-md"
                  {...field}
                  onChange={(e) => {
                    const slug = formatId(e.target.value);
                    field.onChange(slug);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </FormUnsavedBar>
  );
};
