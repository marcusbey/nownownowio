"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ImageFormItem } from "@/features/images/ImageFormItem";
import { LoadingButton } from "@/features/form/SubmitButton";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrganizationDetailsAction } from "../org.action";
import {
  OrgDetailsFormSchema,
  type OrgDetailsFormSchemaType,
} from "../org.schema";
import { useEffect } from "react";

type ProductFormProps = {
  defaultValues: OrgDetailsFormSchemaType;
};

export const OrgDetailsForm = ({ defaultValues }: ProductFormProps) => {
  const form = useZodForm({
    schema: OrgDetailsFormSchema,
    defaultValues,
  });
  const router = useRouter();
  const isDirty = form.formState.isDirty;
  const isPending = form.formState.isSubmitting;

  const mutation = useMutation({
    mutationFn: async (values: OrgDetailsFormSchemaType) => {
      const result = await updateOrganizationDetailsAction(values);

      if (!result || result.serverError) {
        toast.error(result?.serverError ?? "Failed to update organization");
        return;
      }

      toast.success("Organization updated successfully");
      router.refresh();
      form.reset(result.data as OrgDetailsFormSchemaType);
    },
  });

  // Reset form when defaultValues change
  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <Form
      form={form}
      onSubmit={async (values) => {
        await mutation.mutateAsync(values);
      }}
    >
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Image</FormLabel>
              <FormControl>
                <ImageFormItem
                  className="size-24 rounded-lg"
                  onChange={(url) => field.onChange(url)}
                  imageUrl={field.value || defaultValues.image}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="websiteUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website URL</FormLabel>
              <FormControl>
                <Input {...field} type="url" value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            loading={isPending}
            disabled={!form.formState.isDirty}
          >
            Save Changes
          </LoadingButton>
        </div>
      </div>
    </Form>
  );
};
