import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import LandingPage from "./landing/LandingPage";

export default async function HomePage() {
  const user = await auth();

  if (user) {
    // Find the user's organization
    const membership = await prisma.organizationMembership.findFirst({
      where: { userId: user.id },
      include: { organization: true },
    });

    if (membership && membership.organization) {
      // Redirect to the organization's page
      redirect(`/orgs/${membership.organization.slug}`);
    } else {
      // If no organization found, redirect to create new org page
      redirect("/orgs/new");
    }
  }
  return <LandingPage />;
}
