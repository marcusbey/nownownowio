"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { LoadingButton } from "@/features/form/SubmitButton";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { createPromotionCode, getPromotionStats, type PromotionCodeInput } from "../../api/promotion/bulk/route";

const CreatePromotionSchema = z.object({
  campaignName: z.string().min(3),
  expiresInDays: z.number().min(1).optional(),
});

export default function PromotionPage() {
  const [currentCode, setCurrentCode] = useState<string>();
  const [stats, setStats] = useState<any>();

  const form = useZodForm({
    schema: CreatePromotionSchema,
    defaultValues: {
      campaignName: "",
      expiresInDays: 90,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (values: PromotionCodeInput) => {
      const result = await createPromotionCode(values);
      if (!result) {
        throw new Error("Failed to create promotion code");
      }
      return result;
    },
    onSuccess: (data) => {
      setCurrentCode(data.code);
      toast.success("Promotion code created successfully!");
      // Get initial stats
      refreshStats(data.code);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const refreshStats = async (code: string) => {
    const result = await getPromotionStats(code);
    if (result) {
      setStats(result);
    }
  };

  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Promotion Code Management</h1>
        <p className="text-muted-foreground">Create and manage promotion codes for your community</p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Create New Promotion Code</CardTitle>
            <CardDescription>
              Generate an unlimited-use promotion code for your community
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form
              form={form}
              onSubmit={async (values) => {
                await createMutation.mutateAsync(values);
              }}
            >
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="campaignName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Campaign Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="LAUNCH2024" />
                      </FormControl>
                      <FormDescription>
                        This will be converted to uppercase and used as the promotion code
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiresInDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expires In (Days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of days before the code expires
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <LoadingButton
                  type="submit"
                  loading={createMutation.isPending}
                  className="w-full"
                >
                  Generate Code
                </LoadingButton>
              </div>
            </Form>
          </CardContent>
        </Card>

        {currentCode && (
          <Card>
            <CardHeader>
              <CardTitle>Current Promotion Code</CardTitle>
              <CardDescription>
                Share this code with your community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-mono text-lg">{currentCode}</p>
                </div>

                {stats && (
                  <div className="space-y-2">
                    <p>
                      <strong>Status:</strong> {stats.active ? "Active" : "Inactive"}
                    </p>
                    <p>
                      <strong>Times Used:</strong> {stats.timesRedeemed || 0}
                    </p>
                    <p>
                      <strong>Expires:</strong>{" "}
                      {stats.expiresAt
                        ? new Date(stats.expiresAt * 1000).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                )}

                <Button
                  variant="outline"
                  onClick={() => currentCode && refreshStats(currentCode)}
                  className="w-full"
                >
                  Refresh Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
