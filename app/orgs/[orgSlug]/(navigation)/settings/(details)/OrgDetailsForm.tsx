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
import { OrganizationImageUploader } from "@/features/ui/images/organization-image-uploader";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
    mode: "onChange",
  });

  const router = useRouter();
  const queryClient = useQueryClient();
  const params = useParams();

  // Extract organization slug from the URL parameters
  const orgSlug = typeof params.orgSlug === "string" ? params.orgSlug : "";

  // Get the form submit state
  const isPending = form.formState.isSubmitting;
  const isDirty = Object.keys(form.formState.dirtyFields).length > 0;

  // Calculate the bio length
  const bioValue = form.watch("bio") || "";
  const bioLength = bioValue.length;

  // Reset form when defaultValues change
  useEffect(() => {
    form.reset(defaultValues);
  }, [form, defaultValues]);

  // Fix the linter error and properly extract organization data
  const onSubmitSuccess = (data: unknown) => {
    // Dismiss any loading toasts
    toast.dismiss();

    if (data && typeof data === "object" && "data" in data) {
      toast.success("Organization updated successfully");

      // Log the raw data for debugging
      console.log("🔍 Raw server response:", JSON.stringify(data));

      // Extract the organization data with type assertion
      const orgData = data.data as {
        name: string;
        email: string | null;
        image: string | null;
        bannerImage: string | null;
        bio: string | null;
        websiteUrl: string | null;
      };

      // Create new values object from the server response
      const newValues = {
        name: orgData.name,
        email: orgData.email ?? "",
        image: orgData.image,
        bannerImage: orgData.bannerImage,
        bio: orgData.bio ?? "",
        websiteUrl: orgData.websiteUrl ?? "",
      };

      // Log the values for debugging
      console.log("🔍 Server returned values:", JSON.stringify(newValues));

      // Forcefully set the image values to ensure they're recognized
      form.setValue("image", newValues.image, { shouldDirty: false });
      form.setValue("bannerImage", newValues.bannerImage, {
        shouldDirty: false,
      });

      // Update the form with new values
      form.reset(newValues);

      // Invalidate relevant queries to update UI without full page reload
      queryClient
        .invalidateQueries({ queryKey: ["organization"] })
        .then(() => {
          router.refresh(); // Force a refresh to update any displayed images
        })
        .catch((error: Error) => {
          console.error("Error invalidating queries:", error);
        });
    }
  };

  const mutation = useMutation({
    mutationFn: async (values: OrgDetailsFormSchemaType) => {
      console.log("🔍 Mutation submitting values:", JSON.stringify(values));

      // Show toast to indicate saving is in progress
      const toastId = toast.loading("Saving organization changes...");

      try {
        // Include orgSlug directly in the values object
        const result = await updateOrganizationDetailsAction({
          ...values,
          orgSlug,
        });

        // Success handling moved to onSuccess callback
        toast.dismiss(toastId);
        return result;
      } catch (error) {
        // Error handling
        toast.dismiss(toastId);
        console.error("🔍 Action error:", error);
        throw error;
      }
    },
    onSuccess: onSubmitSuccess,
    onError: (error) => {
      console.error("Update failed:", error);
      toast.error(
        `Failed to update organization: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    },
  });

  return (
    <Form
      form={form}
      onSubmit={async (values) => {
        console.log("🔍 Submitting form with values:", {
          ...values,
          orgSlug,
          hasImage: !!values.image,
          imageValue: values.image,
        });

        try {
          // Ensure orgSlug is always included from params
          await mutation.mutateAsync({
            ...values,
            orgSlug,
          });
        } catch (error) {
          // Error is already handled in the mutation's onError
          console.error("Form submission failed:", error);
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
                <OrganizationImageUploader
                  className="size-24 rounded-lg"
                  onChange={(url) => {
                    console.log("🔍 Logo onChange called with URL:", url);
                    // Force set the value and mark as dirty
                    form.setValue("image", url, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                    // Also trigger field.onChange for completeness
                    field.onChange(url);

                    // Debug check if it was set
                    setTimeout(() => {
                      console.log("🔍 After logo change - Form values:", {
                        formImage: form.getValues("image"),
                        isDirty: form.formState.isDirty,
                        dirtyFields: Object.keys(form.formState.dirtyFields),
                      });
                    }, 100);
                  }}
                  imageUrl={field.value ?? undefined}
                  type="logo"
                  maxSizeMB={2}
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
                <OrganizationImageUploader
                  className="h-32 w-full rounded-lg object-cover"
                  onChange={(url) => {
                    console.log("🔍 Banner onChange called with URL:", url);
                    // Force set the value and mark as dirty
                    form.setValue("bannerImage", url, {
                      shouldDirty: true,
                      shouldTouch: true,
                      shouldValidate: true,
                    });
                    // Also trigger field.onChange for completeness
                    field.onChange(url);

                    // Debug check if it was set
                    setTimeout(() => {
                      console.log("🔍 After banner change - Form values:", {
                        formBannerImage: form.getValues("bannerImage"),
                        isDirty: form.formState.isDirty,
                        dirtyFields: Object.keys(form.formState.dirtyFields),
                      });
                    }, 100);
                  }}
                  imageUrl={field.value ?? undefined}
                  type="banner"
                  maxSizeMB={4}
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

        <div className="flex justify-end gap-3">
          <Button
            type="submit"
            disabled={!isDirty || isPending}
            className="relative"
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    </Form>
  );
}
