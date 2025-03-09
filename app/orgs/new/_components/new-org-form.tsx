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
import { LoadingButton } from "@/features/ui/form/submit-button";
import { Loader2, CheckCircle2, XCircle, Globe, FileText, BadgeCheck } from "lucide-react";
import { isActionSuccessful } from "@/lib/actions/actions-utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createOrganizationAction } from "../new-org.action";
import type { NewOrganizationSchemaType} from "../new-org.schema";
import { NewOrgsSchema } from "../new-org.schema";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/core/select";

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
      planId: "FREE",
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
      
      const result = await createOrganizationAction(formattedValues);

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
                      className={cn("w-full pr-10", {
                        "border-green-500 focus-visible:ring-green-500": isBlurred && nameAvailabilityQuery.data?.available,
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
                {isBlurred && !nameAvailabilityQuery.isLoading && nameAvailabilityQuery.data && (
                  <p className={cn("text-sm mt-1", {
                    "text-green-500": nameAvailabilityQuery.data.available,
                    "text-red-500": !nameAvailabilityQuery.data.available,
                  })}>
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
                        className="w-full pl-10"
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
                        className="min-h-[100px] w-full resize-y pl-10"
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
          
          <FormField
            control={form.control}
            name="planId"
            render={({ field }) => (
              <FormItem>
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
                    <SelectItem value="FREE">
                      <div className="flex items-center">
                        <span>Free - Basic features for small teams</span>
                        <BadgeCheck className="ml-2 size-4 text-green-500" />
                      </div>
                    </SelectItem>
                    <SelectItem value="BASIC">
                      Basic - Enhanced features for growing teams
                    </SelectItem>
                    <SelectItem value="PRO">
                      Pro - Advanced features for professional teams
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  You can change your plan anytime after creating your organization
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
