"use client";

import { Button } from "@/components/core/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/data-display/avatar";
import { Badge } from "@/components/data-display/badge";
import { Progress } from "@/components/feedback/progress";
import { OrganizationMembershipRole } from "@prisma/client";
import { ChevronDown, ChevronUp, Mail, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/core/select";
import { Input } from "@/components/core/input";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { inviteUserInOrganizationAction, updateOrganizationMemberAction } from "../org.action";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useZodForm,
} from "@/components/core/form";
import { LoadingButton } from "@/features/ui/form/submit-button";

type MembersManagementProps = {
  members: {
    id: string;
    userId: string;
    roles: OrganizationMembershipRole[];
    user: {
      id: string;
      name: string | null;
      email: string;
      image: string | null;
    };
  }[];
  invitedEmail: string[];
  maxMembers: number;
  orgSlug: string;
  currentUserRoles?: OrganizationMembershipRole[];
  currentUserId: string;
};

export function MembersManagement({ 
  members, 
  invitedEmail, 
  maxMembers, 
  orgSlug,
  currentUserRoles = [],
  currentUserId
}: MembersManagementProps) {
  // Check if user has admin or owner permissions
  const hasAdminPermissions = currentUserRoles.includes(OrganizationMembershipRole.ADMIN) || 
                             currentUserRoles.includes(OrganizationMembershipRole.OWNER);
  const hasOwnerPermissions = currentUserRoles.includes(OrganizationMembershipRole.OWNER);
  const [isExpanded, setIsExpanded] = useState(false);
  const router = useRouter();
  
  // Member to remove state
  const [memberToRemove, setMemberToRemove] = useState<any>(null);
  
  // Form for member roles
  const memberForm = useZodForm({
    schema: z.object({
      members: z.array(
        z.object({
          id: z.string(),
          userId: z.string(),
          roles: z.array(z.nativeEnum(OrganizationMembershipRole)),
        })
      ),
    }),
    defaultValues: {
      members: members.map((m) => ({
        roles: m.roles,
        id: m.id,
        userId: m.userId,
      })),
    },
  });
  
  // Form for inviting new members
  const inviteSchema = z.object({
    email: z.string().email(),
  });
  
  const inviteForm = useZodForm({
    schema: inviteSchema,
    defaultValues: {
      email: "",
    },
  });
  
  // Mutation for updating member roles
  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      const result = await updateOrganizationMemberAction(values);

      if (!result || result.serverError) {
        toast.error(result?.serverError ?? "Failed to update member roles");
        return;
      }

      router.refresh();
      toast.success("Member roles updated successfully");
      return result;
    },
  });
  
  // Mutation for inviting new members
  const inviteMutation = useMutation({
    mutationFn: async (values: z.infer<typeof inviteSchema>) => {
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
          inviteForm.reset();
          router.refresh();
          return result;
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
        throw error;
      }
    },
  });
  
  // Handle role change
  const handleRoleChange = (id: string, role: OrganizationMembershipRole) => {
    const members = memberForm.getValues("members");
    const index = members.findIndex((m) => m.id === id);
    if (index === -1) return;
    memberForm.setValue(`members.${index}.roles.0`, role);
    updateMutation.mutate(memberForm.getValues());
  };
  
  // Handle remove member
  const handleRemoveMember = () => {
    if (!memberToRemove) return;
    
    const members = memberForm.getValues("members");
    memberForm.setValue(
      "members",
      members.filter((m) => m.id !== memberToRemove.id)
    );
    updateMutation.mutate(memberForm.getValues());
    setMemberToRemove(null);
  };
  
  // Handle cancel invite (placeholder)
  const handleCancelInvite = (email: string) => {
    // Implement cancel invite logic
    toast.info("Cancel invite functionality will be implemented soon");
  };
  
  return (
    <div className="space-y-4">
      {/* Preview section (always visible) */}
      <div className="space-y-3">
        {members.slice(0, 3).map((member) => (
          <div key={member.id} className="flex items-center justify-between rounded-md bg-muted/30 p-3">
            <div className="flex items-center gap-3">
              <Avatar>
                {member.user.image ? (
                  <AvatarImage src={member.user.image} alt={member.user.name || "Member"} />
                ) : (
                  <AvatarFallback>
                    {(member.user.name || member.user.email || "").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-medium">{member.user.name}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs uppercase">
              {member.roles[0]}
            </Badge>
          </div>
        ))}
        
        {members.length > 3 && (
          <div className="py-2 text-center text-sm text-muted-foreground">
            + {members.length - 3} more members
          </div>
        )}
      </div>
      
      {/* Invited Members Preview */}
      {invitedEmail.length > 0 && !isExpanded && (
        <div className="mt-4">
          <h4 className="mb-2 text-sm font-medium">Pending Invitations</h4>
          <div className="space-y-2">
            {invitedEmail.map((email, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="size-4" />
                <span>{email}</span>
                <Badge variant="secondary" className="ml-auto text-xs">Pending</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Toggle button */}
      <div className="mt-6 flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="size-4" />
              Hide Management
            </>
          ) : (
            <>
              <ChevronDown className="size-4" />
              Show Management
            </>
          )}
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{members.length}/{maxMembers}</span>
          <Progress 
            value={(members.length / maxMembers) * 100} 
            className="h-2 w-20 bg-primary/20" 
          />
        </div>
      </div>
      
      {/* Expanded management section */}
      {isExpanded && (
        <div className="mt-6 space-y-8 border-t pt-6">
          {/* Current Members Management */}
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Current Members</h4>
            
            <div className="space-y-2 divide-y rounded-md border">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage src={member.user.image ?? undefined} />
                      <AvatarFallback>
                        {member.user.name?.[0] ?? member.user.email[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {member.user.name ?? member.user.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {hasOwnerPermissions && member.user.id !== currentUserId && (
                      <Select
                        value={member.roles[0]}
                        onValueChange={(value) => {
                          handleRoleChange(member.id, value as OrganizationMembershipRole);
                        }}
                        disabled={!hasOwnerPermissions}
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
                    
                    {!hasOwnerPermissions && (
                      <Badge variant="outline" className="text-xs uppercase">
                        {member.roles[0]}
                      </Badge>
                    )}

                    {hasOwnerPermissions && member.user.id !== currentUserId && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
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
                              onClick={() => {
                                setMemberToRemove(member);
                                handleRemoveMember();
                              }}
                            >
                              Remove
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Pending Invitations Management */}
          {invitedEmail.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Pending Invitations</h4>
              
              <div className="space-y-2 divide-y rounded-md border">
                {invitedEmail.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{email[0]}</AvatarFallback>
                      </Avatar>
                      <p className="font-medium">{email}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={() => handleCancelInvite(email)}
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Invite New Members */}
          {hasAdminPermissions && (
            <div className="space-y-4">
              <h4 className="text-lg font-medium">Invite New Members</h4>
              
              <Form
                form={inviteForm}
                onSubmit={async (v) => inviteMutation.mutateAsync(v)}
                className="flex items-end gap-2"
              >
                <FormField
                  control={inviteForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="member@example.com" 
                          {...field} 
                          disabled={inviteMutation.isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <LoadingButton
                  loading={inviteMutation.isPending}
                  type="submit" 
                  className="cursor-pointer"
                  disabled={members.length >= maxMembers || (members.length + (invitedEmail.length || 0)) >= maxMembers}
                >
                  <Plus size={16} className="mr-2" />
                  Invite
                </LoadingButton>
              </Form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
