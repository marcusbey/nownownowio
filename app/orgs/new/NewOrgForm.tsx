"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingButton } from "@/features/form/SubmitButton";
import { PLANS } from "@/features/plans/plans";
import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { formatId } from "@/lib/format/id";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganizationAction } from "./new-org.action";
import { NewOrganizationSchemaType, NewOrgsSchema } from "./new-org.schema";

export const NewOrganizationForm = () => {
  const form = useZodForm({
    schema: NewOrgsSchema,
    defaultValues: {
      planId: PLANS[0].id,
      name: "",
      slug: "",
      websiteUrl: "",
    },
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
      className="flex w-full flex-col gap-6 lg:gap-8"
    >
      <Card className="overflow-hidden bg-card">
        <CardContent className="mt-6 flex flex-col gap-4 lg:gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Organization Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    className="input"
                    placeholder="Enter organization name"
                    onChange={(e) => {
                      field.onChange(e);
                      form.setValue("slug", formatId(e.target.value));
                    }}
                    value={field.value || ""}
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
              <FormItem className="flex flex-col">
                <FormLabel>Organization ID</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    {...field}
                    className="input"
                    placeholder="Enter organization ID"
                    onChange={(e) => {
                      field.onChange(e);
                      form.setValue("slug", formatId(e.target.value));
                    }}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>
                  The organization ID is used to identify the organization, it
                  will be used in all the URLs.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Organization Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    {...field}
                    className="input"
                    placeholder="Enter organization email"
                  />
                </FormControl>
                <FormDescription>
                  The billing email, will be used to send invoices, plan
                  reminders.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    {...field}
                    className="input"
                    placeholder="Enter organization website URL"
                  />
                </FormControl>
                <FormDescription>
                  The official website of your organization.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="planId"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Select Plan</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PLANS.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price}/{plan.type || "month"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
        <CardFooter className="flex justify-end border-t border-border bg-background pt-6">
          <LoadingButton
            type="submit"
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create organization
          </LoadingButton>
        </CardFooter>
      </Card>
    </Form>
  );
};
