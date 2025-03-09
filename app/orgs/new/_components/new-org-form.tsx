"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/data-display/card";
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
import { LoadingButton } from "@/features/ui/form/submit-button";
import { Loader2 } from "lucide-react";
import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { formatId } from "@/lib/format/id";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganizationAction } from "../new-org.action";
import type { NewOrganizationSchemaType} from "../new-org.schema";
import { NewOrgsSchema } from "../new-org.schema";

export function NewOrganizationForm() {
  const form = useZodForm({
    schema: NewOrgsSchema,
  });
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: NewOrganizationSchemaType) => {
      const result = await createOrganizationAction(values);

      if (!isActionSuccessful(result)) {
        toast.error(result?.serverError ?? "Failed to create organization");
        return;
      }

      router.refresh();
      form.reset(result.data as NewOrganizationSchemaType);
      router.push(`/orgs/${result.data.slug}`);
    },
  });

  return (
    <Form
      form={form}
      onSubmit={async (v) => mutation.mutateAsync(v)}
      className="w-full max-w-3xl mx-auto"
    >
      <Card className="bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Organization Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    className="w-full"
                    placeholder="Enter organization name"
                    onChange={(e) => {
                      field.onChange(e);
                      form.setValue("slug", formatId(e.target.value));
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organization ID</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    className="w-full"
                    placeholder="Enter organization ID"
                    onChange={(e) => {
                      field.onChange(formatId(e.target.value));
                    }}
                  />
                </FormControl>
                <FormDescription>
                  The organization ID is used to identify the organization. It will be used in all the URLs.
                </FormDescription>
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
                    type="email"
                    {...field}
                    className="w-full"
                    placeholder="Enter organization email"
                  />
                </FormControl>
                <FormDescription>
                  The billing email, will be used to send invoices, plan reminders.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <LoadingButton
            className="w-full sm:w-auto"
          >
            {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create organization
          </LoadingButton>
        </CardFooter>
      </Card>
    </Form>
  );
}
