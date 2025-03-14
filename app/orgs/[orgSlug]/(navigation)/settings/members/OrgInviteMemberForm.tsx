"use client";

import { Button } from "@/components/core/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/composite/dialog";
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
import { LoadingButton } from "@/features/ui/form/submit-button";
import { useMutation } from "@tanstack/react-query";
import { Mail, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { inviteUserInOrganizationAction } from "../org.action";

const Schema = z.object({
  email: z.string().email(),
});

type SchemaType = z.infer<typeof Schema>;

type Props = {
  invitedEmail: string[];
  maxMembers: number;
  currentMemberCount: number;
};

export const OrganizationInviteMemberForm = ({ invitedEmail, maxMembers, currentMemberCount }: Props) => {
  const [open, setOpen] = useState(false);
  const form = useZodForm({
    schema: Schema,
    defaultValues: {
      email: "",
    },
  });
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: SchemaType) => {
      try {
        const result = await inviteUserInOrganizationAction(values);
        if (result === undefined) {
          throw new Error("Failed to invite user");
        }
        if ("serverError" in result) {
          throw new Error(result.serverError);
        }
        if ("fieldErrors" in result && typeof result.fieldErrors === 'object' && result.fieldErrors && 'email' in result.fieldErrors) {
          const emailErrors = result.fieldErrors.email;
          if (Array.isArray(emailErrors) && emailErrors.length > 0) {
            throw new Error(emailErrors[0]);
          }
        }
        if ("data" in result) {
          toast.success("Invitation sent successfully");
          form.reset();
          setOpen(false);
          router.refresh();
        } else {
          throw new Error("Failed to invite user");
        }
      } catch (error) {
        console.error("Invitation error:", error);
        if (error instanceof Error) {
          toast.error(error.message);
        } else {
          toast.error("Failed to send invitation. Please try again.");
        }
        throw error; // Re-throw to mark mutation as failed
      }
    },
  });

  return (
    <Dialog 
      open={open} 
      onOpenChange={(v) => {
        if (!v) form.reset();
        setOpen(v);
      }}
    >
      <DialogTrigger asChild>
        <Button 
          type="button" 
          variant="default"
          className="cursor-pointer"
          disabled={currentMemberCount >= maxMembers || (currentMemberCount + (invitedEmail.length || 0)) >= maxMembers}
        >
          <Mail className="mr-2" size={16} />
          Invite member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite member</DialogTitle>
        </DialogHeader>
        <Form
          form={form}
          onSubmit={async (v) => mutation.mutateAsync(v)}
          className="flex w-full items-end gap-2"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="demo@gmail.com" 
                    {...field} 
                    disabled={mutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton
            loading={mutation.isPending}
            type="submit" 
            className="cursor-pointer"
            disabled={currentMemberCount >= maxMembers || (currentMemberCount + (invitedEmail.length || 0)) >= maxMembers}
          >
            <Plus size={16} className="mr-2" />
            Invite
          </LoadingButton>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
