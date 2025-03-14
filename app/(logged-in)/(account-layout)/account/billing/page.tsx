import { requiredAuth } from "@/lib/auth/helper";
import { OrgSelectQuery } from "@/lib/organizations/get-org";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import BillingPage from "../../../../orgs/[orgSlug]/(navigation)/settings/billing/page";

export default async function RoutePage() {
  const user = await requiredAuth();
  const org = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: user.id,
        },
      },
    },
    select: OrgSelectQuery(user.id),
  });

  if (!org) {
    notFound();
  }

  // In Next.js 15, both params and searchParams are required and must be Promises
  return <BillingPage 
    params={Promise.resolve({ orgSlug: org.slug })} 
    searchParams={Promise.resolve({})} 
  />;
}
