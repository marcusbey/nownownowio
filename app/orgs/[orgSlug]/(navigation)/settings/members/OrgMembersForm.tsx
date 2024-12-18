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
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
} from "@/components/ui/multi-select";
import { Progress } from "@/components/ui/progress";
import {
  InlineTooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Typography } from "@/components/ui/typography";
import { alertDialog } from "@/features/alert-dialog/alert-dialog-store";
import { FormUnsavedBar } from "@/features/form/FormUnsavedBar";
import { openGlobalDialog } from "@/features/global-dialog/GlobalDialogStore";
import { OrganizationMembershipRole } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { X, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateOrganizationMemberAction } from "../org.action";
import type { OrgMemberFormSchemaType } from "../org.schema";
import { OrgMemberFormSchema } from "../org.schema";
import { OrganizationInviteMemberForm } from "./OrgInviteMemberForm";

type OrgMembersFormProps = {
  defaultValues: OrgMemberFormSchemaType;
  members: {
    id: string;
    name: string | null;
    email: string;
    image?: string | null;
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
        toast.error(result?.serverError ?? "Failed to invite user");
        return;
      }

      router.refresh();
      form.reset(result.data as OrgMemberFormSchemaType);
    },
  });

  return (
    <TooltipProvider>
      <FormUnsavedBar
        form={form}
        onSubmit={async (v) => mutation.mutateAsync(v)}
        className="flex w-full flex-col gap-6 lg:gap-8"
      >
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              People who have access to your organization.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col">
            {form.getValues("members")?.map((baseMember, index) => {
              const member = members.find((m) => m.id === baseMember.id);
              if (!member) {
                return null;
              }
              return (
                <div key={member.id}>
                  <div className="my-2 flex flex-wrap items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.image ?? undefined} />
                      <AvatarFallback>
                        {member.name?.[0] ?? member.email[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <Typography variant="large">
                        {member.name}
                      </Typography>
                      <Typography variant="muted">
                        {member.email}
                      </Typography>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      <FormField
                        control={form.control}
                        name={`members.${index}.role`}
                        render={({ field }) => (
                          <MultiSelector
                            values={[field.value]}
                            onValuesChange={(values) => field.onChange(values[0])}
                          >
                            <MultiSelectorTrigger>
                              <MultiSelectorInput placeholder="Select role" />
                            </MultiSelectorTrigger>
                            <MultiSelectorContent>
                              <MultiSelectorList>
                                {Object.values(OrganizationMembershipRole).map(
                                  (role) => (
                                    <MultiSelectorItem
                                      key={role}
                                      value={role}
                                      textValue={role}
                                    >
                                      {role}
                                    </MultiSelectorItem>
                                  )
                                )}
                              </MultiSelectorList>
                            </MultiSelectorContent>
                          </MultiSelector>
                        )}
                      />
                      <InlineTooltip content="Remove member">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            alertDialog.onOpen({
                              title: "Remove member",
                              description:
                                "Are you sure you want to remove this member?",
                              onConfirm: () => {
                                const members = form.getValues("members");
                                form.setValue(
                                  "members",
                                  members.filter((m) => m.id !== member.id)
                                );
                              },
                            });
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </InlineTooltip>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="mt-4">
              <Progress
                value={
                  ((form.getValues("members")?.length ?? 0) / maxMembers) * 100
                }
                className="h-2"
              />
              <Typography variant="muted">
                {form.getValues("members")?.length ?? 0} of {maxMembers} members
              </Typography>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invite Members</CardTitle>
            <CardDescription>
              Invite new members to your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <OrganizationInviteMemberForm
              invitedEmail={invitedEmail}
              maxMembers={maxMembers}
              currentMemberCount={form.getValues("members")?.length ?? 0}
            />
          </CardContent>
        </Card>
      </FormUnsavedBar>
    </TooltipProvider>
  );
};
