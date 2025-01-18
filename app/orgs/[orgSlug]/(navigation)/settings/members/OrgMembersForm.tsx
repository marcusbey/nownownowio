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
import { SettingsCard } from "@/features/settings/SettingsLayout";

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

  const handleRoleChange = (id: string, role: OrganizationMembershipRole) => {
    const members = form.getValues("members");
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) return;
    form.setValue(`members.${index}.roles.0`, role);
  };

  const handleCancelInvite = (email: string) => {
    // implement cancel invite logic
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Current Members */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Typography variant="h3" className="text-lg font-medium">
              Current Members
            </Typography>
            <Typography variant="muted" className="text-sm">
              {members.length} / {maxMembers} members
            </Typography>
          </div>
          <Progress value={(members.length / maxMembers) * 100} className="w-[100px]" />
        </div>

        <SettingsCard>
          <CardContent className="p-0">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between border-b p-4 last:border-0"
              >
                <div className="flex items-center gap-4">
                  <Avatar>
                    <AvatarImage src={member.image ?? undefined} />
                    <AvatarFallback>
                      {member.name?.[0] ?? member.email[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Typography variant="default">
                      {member.name ?? member.email}
                    </Typography>
                    <Typography variant="small" className="text-muted-foreground">
                      {member.email}
                    </Typography>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`members.${members.findIndex(
                      (m) => m.id === member.id,
                    )}.roles.0`}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleRoleChange(member.id, value as OrganizationMembershipRole);
                        }}
                      >
                        <SelectTrigger className="w-[110px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OrganizationMembershipRole).map(
                            (role) => (
                              <SelectItem key={role} value={role}>
                                {role}
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove member</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove this member from the
                          organization? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          variant="destructive"
                          onClick={() => handleRemoveMember()}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))}
          </CardContent>
        </SettingsCard>
      </div>

      {/* Pending Invitations */}
      {invitedEmail.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Typography variant="h3" className="text-lg font-medium">
              Pending Invitations
            </Typography>
            <Typography variant="muted" className="text-sm">
              These users have been invited but haven't joined yet
            </Typography>
          </div>

          <SettingsCard>
            <CardContent className="p-0">
              {invitedEmail.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between border-b p-4 last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{email[0]}</AvatarFallback>
                    </Avatar>
                    <Typography variant="default">{email}</Typography>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleCancelInvite(email)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </SettingsCard>
        </div>
      )}

      {/* Invite New Members */}
      <div className="space-y-6">
        <div className="space-y-1.5">
          <Typography variant="h3" className="text-lg font-medium">
            Invite New Members
          </Typography>
          <Typography variant="muted" className="text-sm">
            Invite new members to join your organization
          </Typography>
        </div>

        <SettingsCard>
          <CardContent>
            <OrganizationInviteMemberForm
              disabled={members.length >= maxMembers}
            />
          </CardContent>
        </SettingsCard>
      </div>
    </div>
  );
};
