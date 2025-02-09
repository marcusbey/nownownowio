import { BaseLayout } from "@/features/layout/BaseLayout";
import { auth } from "@/lib/auth/auth";
import { SessionProvider } from "next-auth/react";
import type { PropsWithChildren } from "react";

export const metadata = {
  title: 'NowNowNow',
  description: 'Modern social media platform for organizations',
};

export default async function RouteLayout(props: PropsWithChildren) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          <BaseLayout>{props.children}</BaseLayout>
        </SessionProvider>
      </body>
    </html>
  );
}
