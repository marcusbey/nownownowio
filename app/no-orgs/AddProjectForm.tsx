"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(1, "Company name is required"),
  websiteUrl: z.string().url("Invalid URL"),
});

type FormData = z.infer<typeof formSchema>;

export function AddProjectForm() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await AddProjectAction(data);
      // Redirect or show success message
    } catch (error) {
      console.error("Failed to create company:", error);
      // Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Company Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="websiteUrl">Website URL</Label>
        <Input id="websiteUrl" {...register("websiteUrl")} />
        {errors.websiteUrl && (
          <p className="text-red-500">{errors.websiteUrl.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Company"}
      </Button>
    </form>
  );
}
