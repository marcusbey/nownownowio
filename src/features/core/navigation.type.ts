import type { OrganizationMembershipRole } from "@prisma/client";

export type NavigationGroup = {
  title: string;
  roles?: OrganizationMembershipRole[];
  links: NavigationLink[];
  defaultOpenStartPath?: string;
};

export type NavigationLink = {
  href: string;
  icon: string;
  label: string;
  roles?: OrganizationMembershipRole[];
  hidden?: boolean;
};
