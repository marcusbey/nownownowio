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
import { Textarea } from "@/components/core/textarea";
import { Button } from "@/components/core/button";
import { Loader2, CheckCircle2, XCircle, Globe, FileText } from "lucide-react";
import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganizationAction } from "../new-org.action";
import type { NewOrganizationSchemaType} from "../new-org.schema";
import { NewOrgsSchema } from "../new-org.schema";
import { useState } from "react";
import { cn } from "@/lib/utils";
// Select components no longer needed with the new card-based plan selection

type NameAvailabilityResponse = {
  available: boolean;
  message: string;
  slug?: string;
}

export function NewOrganizationForm() {
  const form = useZodForm({
    schema: NewOrgsSchema,
    defaultValues: {
      name: "",
      websiteUrl: "",
      bio: "",
      planId: "PRO_MONTHLY",
      billingPeriod: "MONTHLY",
    },
  });
  const router = useRouter();
  const [nameToCheck, setNameToCheck] = useState("");
  const [isBlurred, setIsBlurred] = useState(false);
  
  // Query to check name availability
  const nameAvailabilityQuery = useQuery<NameAvailabilityResponse>({
    queryKey: ["checkOrgName", nameToCheck],
    queryFn: async () => {
      if (!nameToCheck) return { available: false, message: "Name is required" };
      
      const response = await fetch(`/api/v1/orgs/check-name?name=${encodeURIComponent(nameToCheck)}`);
      if (!response.ok) {
        throw new Error("Failed to check name availability");
      }
      return response.json();
    },
    enabled: nameToCheck.length > 0 && isBlurred,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Handle name change with debounce
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    form.setValue("name", value);
    setIsBlurred(false);
  };

  // Handle blur event to trigger validation
  const handleBlur = () => {
    const value = form.getValues("name");
    if (value) {
      setNameToCheck(value);
      setIsBlurred(true);
    }
  };

  // Create organization mutation
  const mutation = useMutation({
    mutationFn: async (values: NewOrganizationSchemaType) => {
      // Check name availability one last time before submission
      if (nameToCheck) {
        const checkResponse = await fetch(`/api/v1/orgs/check-name?name=${encodeURIComponent(nameToCheck)}`);
        const checkResult = await checkResponse.json();
        
        if (!checkResult.available) {
          toast.error(checkResult.message ?? "Organization name is not available");
          return;
        }
      }
      
      // Ensure data is properly typed before passing to action
      const formattedValues = {
        ...values,
        websiteUrl: values.websiteUrl === "" ? undefined : values.websiteUrl,
        bio: values.bio === "" ? undefined : values.bio,
      };
      
      // First create the organization
      const result = await createOrganizationAction(formattedValues);

      if (!isActionSuccessful(result)) {
        toast.error(result?.serverError ?? "Failed to create organization");
        return;
      }

      // Then create a checkout session for payment
      // Skip payment for LIFETIME plans as they're handled differently
      if (!values.planId.startsWith("FREE_")) {
        try {
          // Use the API route to create a checkout session
          const response = await fetch("/api/v1/payments/create-checkout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              organizationId: result.data.id,
              planId: values.planId,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to create checkout session");
          }

          const checkoutData = await response.json();
          
          if (checkoutData.url) {
            // Redirect to Stripe checkout
            window.location.href = checkoutData.url;
            return;
          }
        } catch {
          toast.error("Failed to create payment session. Please try again.");
          // Error is handled by the toast notification
        }
      }

      // If no payment needed or checkout failed, redirect to org page
      router.refresh();
      form.reset(result.data as NewOrganizationSchemaType);
      router.push(`/orgs/${result.data.slug}`);
    },
  });

  return (
    <Form
      form={form}
      onSubmit={async (v) => mutation.mutateAsync(v)}
      className="mx-auto w-full max-w-3xl"
    >
      <Card className="bg-card shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Create Your Organization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type="text"
                      {...field}
                      className={cn("w-full pr-10 bg-background/80 border-input/80", {
                        "border-red-500 focus-visible:ring-red-500": isBlurred && nameAvailabilityQuery.data && !nameAvailabilityQuery.data.available,
                      })}
                      placeholder="Enter company name"
                      autoFocus
                      onChange={handleNameChange}
                      onBlur={handleBlur}
                    />
                  </FormControl>
                  {isBlurred && !nameAvailabilityQuery.isLoading && nameAvailabilityQuery.data && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {nameAvailabilityQuery.data.available ? (
                        <CheckCircle2 className="size-5 text-green-500" />
                      ) : (
                        <XCircle className="size-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {isBlurred && !nameAvailabilityQuery.isLoading && nameAvailabilityQuery.data && !nameAvailabilityQuery.data.available && (
                  <p className="mt-1 text-sm text-red-500">
                    {nameAvailabilityQuery.data.message}
                  </p>
                )}
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
                <div className="relative">
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Globe className="size-4 text-muted-foreground" />
                      </div>
                      <Input
                        type="url"
                        {...field}
                        value={field.value ?? ""}
                        className="w-full border-input/80 bg-background/80 pl-10"
                        placeholder="https://yourcompany.com"
                      />
                    </div>
                  </FormControl>
                </div>
                <FormDescription>
                  Optional: Enter your company website URL
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
                <FormLabel>Company Bio</FormLabel>
                <div className="relative">
                  <FormControl>
                    <div className="relative">
                      <div className="pointer-events-none absolute left-3 top-3">
                        <FileText className="size-4 text-muted-foreground" />
                      </div>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        className="min-h-[100px] w-full resize-y border-input/80 bg-background/80 pl-10"
                        placeholder="Tell us about your company..."
                      />
                    </div>
                  </FormControl>
                </div>
                <FormDescription>
                  Optional: Brief description of your company (max 500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-6 rounded-lg border p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Select Your Plan</h3>
              <p className="text-sm text-muted-foreground">Choose the plan that works best for your organization</p>
            </div>

            <FormField
              control={form.control}
              name="billingPeriod"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel>Billing Period</FormLabel>
                  <div className="mx-auto flex max-w-xs overflow-hidden rounded-lg border bg-background/80">
                    <div
                      className={cn(
                        "flex-1 cursor-pointer px-4 py-2 text-center transition-all",
                        field.value === "MONTHLY" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        field.onChange("MONTHLY");
                        // Update planId to maintain consistency
                        const currentPlan = form.getValues("planId").split("_")[0];
                        if (currentPlan === "BASIC") {
                          form.setValue("planId", "BASIC_MONTHLY");
                        } else {
                          form.setValue("planId", "PRO_MONTHLY");
                        }
                      }}
                    >
                      <div className="font-medium">Monthly</div>
                    </div>
                    <div
                      className={cn(
                        "flex-1 cursor-pointer px-4 py-2 text-center transition-all",
                        field.value === "YEARLY" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        field.onChange("YEARLY");
                        // Update planId to maintain consistency
                        const currentPlan = form.getValues("planId").split("_")[0];
                        if (currentPlan === "BASIC") {
                          form.setValue("planId", "BASIC_YEARLY");
                        } else {
                          form.setValue("planId", "PRO_YEARLY");
                        }
                      }}
                    >
                      <div className="font-medium">Yearly</div>
                    </div>
                    <div
                      className={cn(
                        "flex-1 cursor-pointer px-4 py-2 text-center transition-all",
                        field.value === "LIFETIME" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                      )}
                      onClick={() => {
                        field.onChange("LIFETIME");
                        // Update planId to maintain consistency
                        const currentPlan = form.getValues("planId").split("_")[0];
                        if (currentPlan === "BASIC") {
                          form.setValue("planId", "BASIC_LIFETIME");
                        } else {
                          form.setValue("planId", "PRO_LIFETIME");
                        }
                      }}
                    >
                      <div className="font-medium">Lifetime</div>
                    </div>
                  </div>
                  <div className="mt-1 text-center text-xs text-muted-foreground">
                    {field.value === "MONTHLY" && "Pay month-to-month"}
                    {field.value === "YEARLY" && "Save 20% annually"}
                    {field.value === "LIFETIME" && "One-time payment"}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="planId"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormLabel>Select Plan</FormLabel>
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Basic Plan */}


                    
                    {/* Basic Plan */}
                    <div
                      className={cn(
                        "flex cursor-pointer flex-col rounded-lg border p-4 transition-all hover:border-primary",
                        !field.value.startsWith("PRO_") && "border-2 border-primary bg-primary/5",
                        field.value.startsWith("PRO_") && "opacity-70"
                      )}
                      onClick={() => {
                        const period = form.getValues("billingPeriod");
                        if (period === "MONTHLY") {
                          field.onChange("BASIC_MONTHLY");
                        } else if (period === "YEARLY") {
                          field.onChange("BASIC_YEARLY");
                        } else {
                          field.onChange("BASIC_LIFETIME");
                        }
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold">Basic</h4>
                      </div>
                      <div className="mb-2">
                        <span className="text-2xl font-bold">
                          {form.getValues("billingPeriod") === "LIFETIME" ? "$199" : 
                           form.getValues("billingPeriod") === "YEARLY" ? "$86" : "$9"}
                        </span>
                        <span className="text-muted-foreground">{form.getValues("billingPeriod") === "LIFETIME" ? " one-time" : form.getValues("billingPeriod") === "YEARLY" ? "/year" : "/month"}</span>
                        {form.getValues("billingPeriod") === "YEARLY" && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Save 20%</span>
                        )}
                      </div>
                      <ul className="mb-4 space-y-2 text-sm">
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>1 organization</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>1 widget per organization</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>Unlimited posts</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>1 team member</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>Post management features</span>
                        </li>
                        <li className="flex items-center text-muted-foreground">
                          <XCircle className="mr-2 size-4 text-muted-foreground" />
                          <span>Includes "Powered by" branding</span>
                        </li>
                      </ul>
                    </div>

                    {/* Pro Plan */}
                    <div
                      className={cn(
                        "flex cursor-pointer flex-col rounded-lg border p-4 transition-all hover:border-primary",
                        field.value.startsWith("PRO_") && "border-2 border-primary bg-primary/5",
                        !field.value.startsWith("PRO_") && "opacity-70"
                      )}
                      onClick={() => {
                        const period = form.getValues("billingPeriod");
                        if (period === "MONTHLY") {
                          field.onChange("PRO_MONTHLY");
                        } else if (period === "YEARLY") {
                          field.onChange("PRO_YEARLY");
                        } else {
                          field.onChange("PRO_LIFETIME");
                        }
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-semibold">Pro</h4>
                        <div className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">Popular</div>
                      </div>
                      <div className="mb-2">
                        <span className="text-2xl font-bold">
                          {form.getValues("billingPeriod") === "LIFETIME" ? "$399" : 
                           form.getValues("billingPeriod") === "YEARLY" ? "$182" : "$19"}
                        </span>
                        <span className="text-muted-foreground">{form.getValues("billingPeriod") === "LIFETIME" ? " one-time" : form.getValues("billingPeriod") === "YEARLY" ? "/year" : "/month"}</span>
                        {form.getValues("billingPeriod") === "YEARLY" && (
                          <span className="ml-2 rounded-full bg-green-100 px-2 py-1 text-xs text-green-800">Save 20%</span>
                        )}
                      </div>
                      <ul className="mb-4 space-y-2 text-sm">
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>Up to 5 organizations</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>1 widget per organization</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>Unlimited posts</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>Up to 5 team members</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>Optional branding removal</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>Advanced analytics</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>Custom domain support</span>
                        </li>
                        <li className="flex items-center">
                          <CheckCircle2 className="mr-2 size-4 text-green-500" />
                          <span>Priority access to new features</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <FormDescription>
                    You can change your plan anytime after creating your organization
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t p-6">
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={!form.getValues("name") || form.formState.isSubmitting || mutation.isPending}
            onClick={() => {
              if (!form.getValues("name")) {
                toast.error("Company name is required");
                return;
              }
              void form.handleSubmit(async (v) => {
                try {
                  await mutation.mutateAsync(v);
                } catch {
                  // Error is already handled in mutation error handler
                }
              })();
            }}
          >
            {mutation.isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create organization
          </Button>
        </CardFooter>
      </Card>
    </Form>
  );
}
