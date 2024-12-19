"use client";

import { Alert } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField, useZodForm } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InlineTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { alertDialog } from "@/features/alert-dialog/alert-dialog-store";
import { openGlobalDialog } from "@/features/global-dialog/GlobalDialogStore";
import { OrganizationMembershipRole } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { X } from "lucide-react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { updateOrganizationMemberAction } from "../org.action";
import type { OrgMemberFormSchemaType } from "../org.schema";
import { OrgMemberFormSchema } from "../org.schema";
import { OrganizationInviteMemberForm } from "./OrgInviteMemberForm";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Mail } from "lucide-react";

type OrgMembersFormProps = {
  defaultValues: OrgMemberFormSchemaType;
  members: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    role: OrganizationMembershipRole;
  }[];
  invitedEmail: string[];
  maxMembers: number;
};

export const OrgMembersForm = ({
  defaultValues,
  members,
  invitedEmail,
  maxMembers,
}: OrgMembersFormProps) => {
  const form = useZodForm({
    schema: OrgMemberFormSchema,
    defaultValues,
  });
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: async (values: OrgMemberFormSchemaType) => {
      const result = await updateOrganizationMemberAction(values);

      if (!result || result.serverError) {
        toast.error(result?.serverError ?? "Failed to update member roles");
        return;
      }

      router.refresh();
      form.reset(result.data as OrgMemberFormSchemaType);
      toast.success("Member roles updated successfully");
    },
  });

  // Auto-save when form values change
  useEffect(() => {
    const subscription = form.watch((value) => {
      if (value !== defaultValues) {
        mutation.mutate(form.getValues());
      }
    });
    return () => subscription.unsubscribe();
  }, [form, defaultValues, mutation]);

  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (mutation.isSuccess) {
      setShowTooltip(true);
      const timer = setTimeout(() => setShowTooltip(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [mutation.isSuccess]);

  const handleOpenDialog = (member: any) => {
    setMemberToRemove(member);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setMemberToRemove(null);
    setIsDialogOpen(false);
  };

  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    
    const members = form.getValues("members");
    form.setValue(
      "members",
      members.filter((m) => m.id !== memberToRemove.id)
    );
    handleCloseDialog();
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
          <CardTitle>Organization Members</CardTitle>
              <CardDescription>
                Manage members and their roles in your organization
              </CardDescription>
            </div>
            <div className="text-right">
              <Typography variant="large" className="font-medium">
                {form.getValues("members")?.length ?? 0} / {maxMembers}
              </Typography>
              <Typography variant="muted">Members</Typography>
            </div>
          </div>
          <Progress
            value={((form.getValues("members")?.length ?? 0) / maxMembers) * 100}
            className="h-2"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Current Members List */}
            <div className="divide-y divide-border rounded-md border">
              {form.getValues("members")?.map((baseMember, index) => {
                const member = members.find((m) => m.id === baseMember.id);
                if (!member) return null;
                return (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={member.image ?? undefined} />
                        <AvatarFallback>
                          {member.name?.[0] ?? member.email[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <Typography variant="large" className="font-medium">
                          {member.name}
                        </Typography>
                        <Typography variant="muted">{member.email}</Typography>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`members.${index}.roles`}
                        render={({ field }) => (
                          <Select
                            value={field.value?.[0]}
                            onValueChange={(value) => {
                              field.onChange([value]);
                            }}
                          >
                            <SelectTrigger className="w-[180px] cursor-pointer rounded-xl">
                              <SelectValue placeholder="Select a role" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {Object.values(OrganizationMembershipRole).map(
                                (role) => (
                                  <SelectItem
                                    key={role}
                                    value={role}
                                    className="cursor-pointer"
                                  >
                                    {role}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <AlertDialogTrigger asChild>
                          <div className="inline-flex cursor-pointer">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="hover:bg-muted"
                              onClick={() => handleOpenDialog(member)}
                            >
                              <span className="sr-only">Remove member</span>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Remove member</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to remove {memberToRemove?.name} from this organization?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel onClick={handleCloseDialog}>
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={handleRemoveMember}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pending Invitations */}
            {invitedEmail.length > 0 && (
              <div className="rounded-md border border-muted bg-muted/10 p-4">
                <Typography variant="h3" className="mb-3">
                  Pending Invitations
                </Typography>
                <div className="space-y-2">
                  {invitedEmail.map((email) => (
                    <div
                      key={email}
                      className="flex items-center justify-between rounded-md bg-background p-3"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar>
                          <AvatarFallback>
                            {email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <Typography variant="muted">{email}</Typography>
                          <Typography variant="small" className="text-muted-foreground">
                            Invitation sent
                          </Typography>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-yellow-400" />
                        <Typography variant="small" className="text-muted-foreground">
                          Pending
                        </Typography>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Invite Members Form */}
            <div className="rounded-md border p-4">
              <Typography variant="h3" className="mb-4">
                Invite New Members
              </Typography>
              <OrganizationInviteMemberForm
                invitedEmail={invitedEmail}
                maxMembers={maxMembers}
                currentMemberCount={form.getValues("members")?.length ?? 0}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
