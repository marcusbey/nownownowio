import { User } from "@prisma/client";

export function getUserProfileUrl(user: {
  name: string;
  organizations?: Array<{
    organization: {
      slug: string;
    };
  }>;
}) {

  const orgSlug = user.organizations?.[0]?.organization?.slug;
  if (orgSlug) {
    return `/orgs/${orgSlug}/profile/${user.name}`;
  }

  return `/profile/${user.name}`;
}
