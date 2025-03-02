import { validateRequest } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { getUserDataSelect, UserData } from "@/lib/types";
import { Metadata } from "next";
import { cache } from "react";
import UserPosts from "./UserPosts";
import { getCurrentOrgCache } from "@/lib/react/cache";
import ProfileHeader from "./ProfileHeader";
import ClientProfile from "./ClientProfile";

interface PageProps {
  params: Promise<{ orgSlug: string }>;
}

const getUser = cache(async (orgSlug: string, loggedInUserId: string) => {
  const org = await getCurrentOrgCache(orgSlug);
  if (!org) return null;

  const user = await prisma.user.findUnique({
    where: {
      id: loggedInUserId,
    },
    select: getUserDataSelect(loggedInUserId),
  });

  if (!user) return null;
  return user;
});

export async function generateMetadata(
  props: PageProps
): Promise<Metadata> {
  const { orgSlug } = await props.params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) return {};

  const user = await getUser(orgSlug, loggedInUser.id);
  if (!user) return {};

  return {
    title: `${user.displayName || user.name} (@${user.name})`,
    description: user.bio || `Check out ${user.name}'s profile on GoNow`,
  };
}

export default async function Page(props: PageProps) {
  const { orgSlug } = await props.params;
  const { user: loggedInUser } = await validateRequest();

  if (!loggedInUser) {
    return (
      <div className="text-center text-muted-foreground">
        Please sign in to view this profile
      </div>
    );
  }

  const user = await getUser(orgSlug, loggedInUser.id);

  if (!user) {
    return (
      <div className="text-center text-muted-foreground">
        Profile not found
      </div>
    );
  }

  return <ClientProfile user={user} orgSlug={orgSlug} />;
}
