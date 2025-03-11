"use client";


import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  useZodForm,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { alertDialog } from "@/features/ui/alert-dialog/alert-dialog-store";
import { Button } from "@/components/core/button";
import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { formatId } from "@/lib/format/id";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrganizationDetailsAction } from "../org.action";
import { OrgDangerFormSchema, type OrgDangerFormSchemaType } from "../org.schema";
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
    <Form
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
      <div className="flex items-end gap-3">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem className="flex-1">
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
        <Button 
          type="submit" 
          variant="outline" 
          size="sm"
          className="shrink-0 border-amber-500/50 text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
        >
          Update Slug
        </Button>
      </div>
    </Form>
  );
};
