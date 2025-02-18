import type { OrganizationMembershipRole } from "@prisma/client";
import type { ReactNode } from "react";

export type NavigationLink = {
    href: string;
    label: string;
    icon?: ReactNode | string;
    roles?: OrganizationMembershipRole[];
};

export type NavigationGroup = {
    title?: string;
    defaultOpenStartPath?: string;
    links: NavigationLink[];
}; 