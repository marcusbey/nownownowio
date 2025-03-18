"use client";

import { Button } from "@/components/core/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { Textarea } from "@/components/core/textarea";
import { ImageFormItem } from "@/features/ui/images/image-form-item";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { updateOrganizationDetailsAction } from "../org.action";
import {
  OrgDetailsFormSchema,
  type OrgDetailsFormSchemaType,
} from "../org.schema";

type OrgDetailsFormProps = {
  defaultValues: OrgDetailsFormSchemaType;
};

export function OrgDetailsForm({ defaultValues }: OrgDetailsFormProps) {
  const form = useZodForm({
    schema: OrgDetailsFormSchema,
    defaultValues,
  });
  const router = useRouter();
  const queryClient = useQueryClient();
  const isDirty = form.formState.isDirty;
  const isPending = form.formState.isSubmitting;
  const bioLength = form.watch("bio")?.length ?? 0;

  const mutation = useMutation({
    mutationFn: async (values: OrgDetailsFormSchemaType) => {
      const result = await updateOrganizationDetailsAction(values);
      return result;
    },
    onSuccess: (data) => {
      if (data?.data) {
        toast.success("Organization updated successfully");

        // Create new values object from the server response
        const newValues = {
          name: data.data.name,
          email: data.data.email ?? "",
          image: data.data.image,
          bio: data.data.bio ?? "",
          websiteUrl: data.data.websiteUrl ?? "",
        };

        // Log the values for debugging
        console.log("Server returned values:", newValues);

        // Update the form with new values
        form.reset(newValues);

        // Invalidate relevant queries to update UI without full page reload
        queryClient
          .invalidateQueries({ queryKey: ["organization"] })
          .then(() => {
            // No need to refresh the router as we've already updated the form
          })
          .catch((error) => {
            console.error("Error invalidating queries:", error);
          });
      }
    },
    onError: (error) => {
      console.error("Update failed:", error);
      toast.error("Failed to update organization");
    },
  });

  // Keep form in sync with defaultValues when they change
  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  // Debug the form values
  useEffect(() => {
    console.log("Current form values:", form.getValues());
  }, [form]);

  return (
    <Form
      form={form}
      onSubmit={async (values) => {
        try {
          await mutation.mutateAsync(values);
        } catch (error) {
          console.error("Update failed:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "An unexpected error occurred. Please try again.",
          );
        }
      }}
    >
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Logo</FormLabel>
              <FormControl>
                <ImageFormItem
                  className="size-24 rounded-lg"
                  onChange={(url) => field.onChange(url)}
                  imageUrl={field.value ?? defaultValues.image ?? undefined}
                />
              </FormControl>
              <FormDescription>
                Recommended size: 256x256px. Maximum size: 5MB
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bannerImage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Banner</FormLabel>
              <FormControl>
                <ImageFormItem
                  className="h-32 w-full rounded-lg object-cover"
                  onChange={(url) => field.onChange(url)}
                  imageUrl={field.value ?? defaultValues.bannerImage ?? undefined}
                />
              </FormControl>
              <FormDescription>
                Recommended size: 1200x300px. Maximum size: 5MB
              </FormDescription>
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
                <Input {...field} placeholder="Enter organization name" />
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
                <Input
                  {...field}
                  type="email"
                  placeholder="organization@example.com"
                />
              </FormControl>
              <FormDescription>
                This email will be used for organization-related communications
              </FormDescription>
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
                <Textarea
                  {...field}
                  placeholder="Tell us about your organization..."
                  maxLength={500}
                />
              </FormControl>
              <FormDescription>{bioLength}/500 characters</FormDescription>
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
                <Input
                  {...field}
                  type="url"
                  placeholder="https://example.com"
                  pattern="https?://.*"
                />
              </FormControl>
              {!field.value && (
                <FormDescription>
                  Must start with http:// or https://
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || isPending}
            className="relative"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Changes
          </Button>
        </div>
      </div>
    </Form>
  );
}
