import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutTitle,
} from "@/features/core/layout";
import { requiredAuth } from "@/lib/auth/helper";
import type { LayoutParams } from "@/types/next";

export default async function RouteLayout(props: LayoutParams) {
  const user = await requiredAuth();
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
