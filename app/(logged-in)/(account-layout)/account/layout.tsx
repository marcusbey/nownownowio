import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";
import { auth } from "@/lib/auth/helper";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import type { LayoutParams } from "@/types/next";

export default async function RouteLayout(props: LayoutParams) {
  const session = await auth();
  if (!session?.user?.email) {
    redirect("/sign-in");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email }
  });

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <Layout>
      <LayoutHeader>
        <LayoutTitle>
          {user.name ? `${user.name}'s` : "Your"} Settings
        </LayoutTitle>
      </LayoutHeader>
      <LayoutContent>{props.children}</LayoutContent>
    </Layout>
  );
}
