import { BaseLayout } from "@/features/layout/BaseLayout";
import { auth } from "@/lib/auth/auth";
import type { PropsWithChildren } from "react";
import { Providers } from "./providers";

export const metadata = {
  title: 'NowNowNow',
  description: 'Modern social media platform for organizations',
};

export default async function RouteLayout(props: PropsWithChildren) {
  const session = await auth();

  return (
    <html lang="en">
      <body>
        <Providers session={session}>
          <BaseLayout>{props.children}</BaseLayout>
        </Providers>
      </body>
    </html>
  );
}
