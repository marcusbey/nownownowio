import { BaseLayout } from "@/features/layout/BaseLayout";
import { auth } from "@/lib/auth/auth";
import { SessionProvider } from "next-auth/react";
import type { PropsWithChildren } from "react";

export default async function RouteLayout(props: PropsWithChildren) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <BaseLayout>{props.children}</BaseLayout>
    </SessionProvider>
  );
}
