import { OrganizationMembershipRole } from "@prisma/client";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { auth } from "../auth/helper";
import { prisma } from "../prisma";

const getOrgSlugFromUrl = () => {
  const headerList = headers();
  const xURL = headerList.get("x-url");

  if (!xURL) {
    return null;
  }

  // get the parameters after /orgs/ or /organizations/ and before a / or ? (if there are params)
  const match = xURL.match(/\/(?:orgs|organizations)\/([^/?]+)(?:[/?]|$)/);

  if (!match) {
    return null;
  }

  const organizationSlug = match[1];

  if (!organizationSlug) {
    return null;
  }

  return organizationSlug;
};

export const getCurrentOrg = async (roles?: OrganizationMembershipRole[]) => {
  const user = await auth();

  if (!user) {
    return null;
  }

  const organizationSlug = getOrgSlugFromUrl();

  if (!organizationSlug) {
    // If no org slug in URL, check if user has any orgs
    const userOrgs = await prisma.organizationMembership.findFirst({
      where: { userId: user.id },
    });

    if (!userOrgs) {
      // Redirect to create new org if user has no orgs
      redirect("/orgs/new");
    }

    // Redirect to first org if user has orgs but no slug in URL
    redirect("/orgs");
  }

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

  return {
    org,
    user,
    roles: org.members[0].roles,
  };
};

export const getRequiredCurrentOrg = async (
  roles?: OrganizationMembershipRole[],
) => {
  const result = await getCurrentOrg(roles);

  if (!result) {
    notFound();
  }

  return result;
};
