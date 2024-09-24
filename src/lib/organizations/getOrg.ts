import { OrganizationMembershipRole } from "@prisma/client";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "../auth/helper";
import { prisma } from "../prisma";

const getOrgSlugFromUrl = (): string | undefined => {
  const headerList = headers();
  const xURL = headerList.get("x-url");
  console.log("x-URL header:", xURL);
  if (!xURL) {
    return undefined;
  }

  // get the parameters after /orgs/ or /organizations/ and before a / or ? (if there are params)
  const match = xURL.match(/\/(?:orgs|organizations)\/([^/?]+)(?:[/?]|$)/);

  if (!match) {
    return undefined;
  }

  const organizationSlug = match[1];

  if (!organizationSlug) {
    return undefined;
  }

  return organizationSlug;
};

export const getCurrentOrg = async (orgSlug?: string, roles?: OrganizationMembershipRole[]) => {
  const user = await auth();

  if (!user) {
    console.log("No user found");
    return null;
  }

  let organizationSlug = orgSlug;

  if (!organizationSlug) {
    organizationSlug = getOrgSlugFromUrl();
    if (!organizationSlug) {
      console.log("No orgSlug found in URL");
      return null;
    }
  }

  console.log("Searching for organization with slug:", organizationSlug);

  const org = await prisma.organization.findFirst({
    where: {
      slug: organizationSlug,
      members: {
        some: {
          userId: user.id,
          roles: roles
            ? {
              hasSome: [...roles, "OWNER"],
            }
            : undefined,
        },
      },
    },
    select: {
      id: true,
      slug: true,
      name: true,
      plan: true,
      email: true,
      image: true,
      stripeCustomerId: true,
      members: {
        where: {
          userId: user.id,
        },
        select: {
          roles: true,
        },
      },
    },
  });

  if (!org) {
    return null;
  }
  console.log("Fetched organization:", org);
  return {
    org,
    user,
    roles: org.members[0].roles,
  };
};

export const getRequiredCurrentOrg = async (
  orgSlug?: string,
  roles?: OrganizationMembershipRole[],
) => {
  const result = await getCurrentOrg(orgSlug, roles);

  if (!result) {
    notFound();
  }

  return result;
};