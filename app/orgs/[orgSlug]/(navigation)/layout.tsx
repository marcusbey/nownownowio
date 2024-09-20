import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { NavigationWrapper } from "@/features/navigation/NavigationWrapper";
import { Layout } from "@/features/page/layout";
import { auth } from "@/lib/auth/helper";
import { getCurrentOrgCache } from "@/lib/react/cache";
import type { LayoutParams } from "@/types/next";
import { Rabbit } from "lucide-react";
import Link from "next/link";
import { OrgNavigation } from "./_navigation/OrgNavigation";

export default async function RouteLayout(
  props: LayoutParams<{ orgSlug: string }>,
) {
  const org = await getCurrentOrgCache();

  if (!org) {
    const user = await auth();
    return (
      <NavigationWrapper>
        <Layout>
          <Alert>
            <Rabbit className="size-4" />
            <div>
              <Typography variant="large">
                Oh! You are not logged in or the organization with the ID{" "}
                <Typography variant="code">{props.params.orgSlug}</Typography>{" "}
                was not found.
              </Typography>
              {user ? (
                <Link
                  href="/orgs"
                  className={buttonVariants({
                    className: "mt-2",
                  })}
                >
                  Return to your organizations
                </Link>
              ) : (
                <Link
                  href="/auth/signin"
                  className={buttonVariants({
                    className: "mt-2",
                  })}
                >
                  Sign in
                </Link>
              )}
            </div>
          </Alert>
        </Layout>
      </NavigationWrapper>
    );
  }

  return <OrgNavigation>{props.children}</OrgNavigation>;
}

// import { validateRequest } from "@/auth";
// import { redirect } from "next/navigation";
// import MenuBar from "./MenuBar";
// import Navbar from "./Navbar";
// import SessionProvider from "./SessionProvider";

// export default async function Layout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const session = await validateRequest();

//   if (!session.user) redirect("/login");

//   return (
//     <SessionProvider value={session}>
//       <div className="flex min-h-screen flex-col">
//         <Navbar />
//         <div className="mx-auto flex w-full max-w-7xl grow gap-5 p-5">
//           <MenuBar className="sticky top-[5.25rem] hidden h-fit flex-none space-y-3 rounded-2xl bg-card px-3 py-5 shadow-sm sm:block lg:px-5 xl:w-80" />
//           {children}
//         </div>
//         <MenuBar className="sticky bottom-0 flex w-full justify-center gap-5 border-t bg-card p-3 sm:hidden" />
//       </div>
//     </SessionProvider>
//   );
// }
