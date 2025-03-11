"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/core/form";
import { Input } from "@/components/core/input";
import { SubmitButton } from "@/features/ui/form/submit-button";
import { toast } from "sonner";
import { setInitialPasswordAction } from "./edit-profile.action";
import type { SetInitialPasswordFormType } from "./edit-profile.schema";
import { SetInitialPasswordFormSchema } from "./edit-profile.schema";

export const SetInitialPasswordForm = () => {
  const form = useZodForm({
    schema: SetInitialPasswordFormSchema,
  });

  const onSubmit = async (values: SetInitialPasswordFormType) => {
    const result = await setInitialPasswordAction(values);
    if (result?.serverError) {
      toast.error(result.serverError);
      return;
    }
    toast.success("Password set successfully");
  };

  return (
    <Form
      form={form}
      onSubmit={async (v) => onSubmit(v)}
      className="flex flex-col gap-4"
    >
      <FormField
        control={form.control}
        name="newPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>New Password</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <SubmitButton className="w-fit self-end">Set Password</SubmitButton>
    </Form>
  );
};
