// To avoid calling many time same function, you can cache them with react `cache` method

import { OrganizationMembershipRole } from "@prisma/client";
import { cache } from "react";
import { getCurrentOrg, getRequiredCurrentOrg } from "../organizations/getOrg";

export const getCurrentOrgCache = cache((orgSlug?: string, roles?: OrganizationMembershipRole[]) => getCurrentOrg(orgSlug, roles));
export const getRequiredCurrentOrgCache = cache((orgSlug?: string, roles?: OrganizationMembershipRole[]) => getRequiredCurrentOrg(orgSlug, roles));
