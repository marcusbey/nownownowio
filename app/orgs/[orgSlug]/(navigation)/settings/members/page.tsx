import { combineWithParentMetadata } from "@/lib/metadata";
import { prisma } from "@/lib/prisma";
import { getRequiredCurrentOrgCache } from "@/lib/react/cache";
import { getOrgsMembers } from "@/query/org/get-orgs-members";
import type { PageParams } from "@/types/next";
import { OrgMembersForm } from "./OrgMembersForm";
import { SettingsPage } from "@/components/layout/SettingsLayout";

export const generateMetadata = combineWithParentMetadata({
  title: "Organization Members",
  description: "Manage members and their roles in your organization.",
});

export default async function MembersPage(props: PageParams) {
  // In Next.js 15, params is a Promise that needs to be properly awaited
  const { orgSlug } = await props.params;
  // Don't restrict by role here - we'll handle permissions in the UI
  const { org } = await getRequiredCurrentOrgCache(orgSlug);

  const members = await getOrgsMembers(org.id);

  const invitations = await prisma.verificationToken.findMany({
    where: {
      identifier: {
        endsWith: `-invite-${org.id}`,
      },
      expires: {
        gt: new Date(),
      },
    },
    select: {
      data: true,
    },
  });

  const invitedEmail = invitations
    .map((i) => (i.data as { email?: string }).email)
    .filter(Boolean) as string[];

  return (
    <SettingsPage
      title="Organization Members"
      description="Manage members and their roles in your organization"
    >
      <OrgMembersForm
        defaultValues={{
          members: members.map((m) => ({
            roles: m.roles,
            id: m.id,
            userId: m.userId,
          })),
          orgSlug,
        }}
        maxMembers={org.plan.maximumMembers}
        members={members.map((m) => ({ role: m.roles[0], ...m.user, id: m.id }))}
        invitedEmail={invitedEmail}
        currentPlanType={org.plan.type}
      />
    </SettingsPage>
  );
}
