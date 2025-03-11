"use client";

import { Alert } from "@/components/feedback/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Button } from "@/components/core/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/data-display/card";
import { FormField, useZodForm } from "@/components/core/form";
import { Progress } from "@/components/feedback/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/core/select";
import {
  InlineTooltip,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/data-display/tooltip";
import { Typography } from "@/components/data-display/typography";
import { alertDialog } from "@/features/ui/alert-dialog/alert-dialog-store";
import { openGlobalDialog } from "@/features/ui/global-dialog/global-dialog-store";
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
} from "@/components/feedback/alert-dialog";
import { Mail } from "lucide-react";
import { SettingsCard } from "@/components/layout/SettingsLayout";
import { PlanBuyButton } from "@/features/billing/payments/buy-button";
import { PLAN_TYPES, PlanType } from "@/features/billing/plans/plans";
import { ArrowUpCircle } from "lucide-react";

type OrgMembersFormProps = {
  defaultValues: OrgMemberFormSchemaType & { orgSlug?: string };
  members: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
    role: OrganizationMembershipRole;
  }[];
  invitedEmail: string[];
  maxMembers: number;
  currentPlanType?: PlanType;
};

/**
 * Determines the next recommended plan type based on the current plan type.
 * @param currentPlanType - The current plan type of the organization
 * @returns The next recommended plan type for upgrade
 */
function getNextPlanType(currentPlanType?: PlanType): PlanType {
  if (!currentPlanType) {
    return PLAN_TYPES.BASIC;
  }
  
  switch (currentPlanType) {
    case PLAN_TYPES.FREE:
      return PLAN_TYPES.BASIC;
    case PLAN_TYPES.BASIC:
      return PLAN_TYPES.PRO;
    case PLAN_TYPES.PRO:
    default:
      return PLAN_TYPES.PRO; // Already at the highest tier
  }
}



export const OrgMembersForm = ({
  defaultValues,
  members,
  invitedEmail,
  maxMembers,
  currentPlanType,
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
    <div className="flex flex-col gap-10">
      {/* Current Members */}
      <div className="space-y-6">
        <div className="flex items-center justify-between bg-card/50 p-4 rounded-lg">
          <div className="space-y-2">
            <Typography variant="h3" className="text-xl font-semibold tracking-tight">
              Current Members
            </Typography>
            <div className="flex items-center gap-2">
              <Typography variant="muted" className="text-sm font-medium">
                {members.length} / {maxMembers} members
              </Typography>
              <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                {Math.round((members.length / maxMembers) * 100)}%
              </span>
            </div>
          </div>
          <Progress value={(members.length / maxMembers) * 100} className="w-[120px] h-2" />
        </div>

        <SettingsCard className="overflow-hidden border shadow-sm">
          <CardContent className="p-0">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between border-b p-5 last:border-0 hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border shadow-sm">
                    <AvatarImage src={member.image ?? undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {member.name?.[0] ?? member.email[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Typography variant="default" className="font-medium">
                      {member.name ?? member.email}
                    </Typography>
                    <Typography variant="small" className="text-muted-foreground flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
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
                        <SelectTrigger className="w-[130px] border-primary/20 bg-primary/5 text-sm font-medium">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.values(OrganizationMembershipRole).map(
                            (role) => (
                              <SelectItem key={role} value={role} className="text-sm">
                                <div className="flex items-center gap-2">
                                  {role === 'OWNER' && <span className="inline-block w-2 h-2 rounded-full bg-yellow-500"></span>}
                                  {role === 'ADMIN' && <span className="inline-block w-2 h-2 rounded-full bg-blue-500"></span>}
                                  {role === 'MEMBER' && <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>}
                                  {role}
                                </div>
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <TooltipProvider>
                    <InlineTooltip>
                      <TooltipTrigger asChild>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
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
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => handleRemoveMember()}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p className="text-xs">Remove member</p>
                      </TooltipContent>
                    </InlineTooltip>
                  </TooltipProvider>
                </div>
              </div>
            ))}
          </CardContent>
        </SettingsCard>
      </div>

      {/* Pending Invitations */}
      {invitedEmail.length > 0 && (
        <div className="space-y-6">
          <div className="space-y-2 bg-card/50 p-4 rounded-lg">
            <div className="flex items-center gap-2">
              <Typography variant="h3" className="text-xl font-semibold tracking-tight">
                Pending Invitations
              </Typography>
              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                {invitedEmail.length}
              </span>
            </div>
            <Typography variant="muted" className="text-sm">
              These users have been invited but haven't joined yet
            </Typography>
          </div>

          <SettingsCard className="overflow-hidden border shadow-sm">
            <CardContent className="p-0">
              {invitedEmail.map((email) => (
                <div
                  key={email}
                  className="flex items-center justify-between border-b p-5 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10 border shadow-sm">
                      <AvatarFallback className="bg-amber-100 text-amber-700 font-medium">{email[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <Typography variant="default" className="font-medium">{email}</Typography>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-amber-500"></span>
                        <span>Invitation pending</span>
                      </div>
                    </div>
                  </div>
                  <TooltipProvider>
                    <InlineTooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors"
                          onClick={() => handleCancelInvite(email)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p className="text-xs">Cancel invitation</p>
                      </TooltipContent>
                    </InlineTooltip>
                  </TooltipProvider>
                </div>
              ))}
            </CardContent>
          </SettingsCard>
        </div>
      )}

      {/* Invite New Members */}
      <div className="space-y-6">
        <div className="space-y-2 bg-card/50 p-4 rounded-lg">
          <Typography variant="h3" className="text-xl font-semibold tracking-tight">
            Invite New Members
          </Typography>
          <Typography variant="muted" className="text-sm">
            Invite new members to join your organization
          </Typography>
          {members.length >= maxMembers && (
            <Alert variant="destructive" className="mt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Typography variant="default" className="font-medium">
                  You've reached your member limit. Upgrade your plan to add more members.
                </Typography>
                <PlanBuyButton
                  planType={getNextPlanType(currentPlanType)}
                  billingCycle="MONTHLY"
                  orgSlug={defaultValues.orgSlug ?? ''}
                  variant="default"
                  size="sm"
                  className="shrink-0 font-medium"
                >
                  <ArrowUpCircle className="mr-2 size-4" />
                  Upgrade Plan
                </PlanBuyButton>
              </div>
            </Alert>
          )}
        </div>

        <SettingsCard className="border shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <OrganizationInviteMemberForm
              invitedEmail={invitedEmail}
              maxMembers={maxMembers}
              currentMemberCount={members.length}
            />
          </CardContent>
        </SettingsCard>
      </div>
    </div>
  );
};
