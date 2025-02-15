import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { NavigationWrapper } from "@/features/navigation/navigation-wrapper";
import { Layout } from "@/features/page/layout";
import { auth } from "@/lib/auth/helper";
import { getCurrentOrgCache } from "@/lib/react/cache";
import type { LayoutParams } from "@/types/next";
import { Rabbit } from "lucide-react";
import Link from "next/link";
import { OrgNavigation } from "./_navigation/org-navigation";

export default async function RouteLayout(
  props: LayoutParams<{ orgSlug: string }>,
) {
  const org = await getCurrentOrgCache();
  const params = await props.params;

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
                <Typography variant="code">{params.orgSlug}</Typography> was not
                found.
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




// import { Alert } from "@/components/ui/alert";
// import { buttonVariants } from "@/components/ui/button";
// import { Typography } from "@/components/ui/typography";
// import { NavigationWrapper } from "@/features/NavigationWrapper";
// import { Layout } from "@/features/page/layout";
// import { auth } from "@/lib/auth/helper";
// import { getCurrentOrgCache } from "@/lib/react/cache";
// import type { LayoutParams } from "@/types/next";
// import { Rabbit } from "lucide-react";
// import Link from "next/link";
// import { Suspense } from "react";
// import { OrgNavigation } from "./OrgNavigation.tsx";

// async function loadData(orgSlug: string) {
//   try {
//     const [org, user] = await Promise.allSettled([
//       getCurrentOrgCache(orgSlug),
//       auth()
//     ]);

//     return {
//       org: org.status === 'fulfilled' ? org.value : null,
//       user: user.status === 'fulfilled' ? user.value : null,
//       error: org.status === 'rejected' ? org.reason : null
//     };
//   } catch (error) {
//     console.error('Error loading data:', error);
//     return { org: null, user: null, error };
//   }
// }

// function LoadingFallback() {
//   return (
//     <div className="flex h-full items-center justify-center">
//       <div className="animate-pulse">Loading organization...</div>
//     </div>
//   );
// }

// export default async function RouteLayout(
//   props: LayoutParams<{ orgSlug: string }>,
// ) {
//   const { org, user, error } = await loadData(props.params.orgSlug);

//   if (error) {
//     console.error('Error in RouteLayout:', error);
//   }

//   if (!org) {
//     return (
//       <NavigationWrapper>
//         <Layout>
//           <Alert>
//             <Rabbit className="size-4" />
//             <div>
//               <Typography variant="large">
//                 {error ? 'An error occurred while loading the organization.' : 
//                   `Oh! You are not logged in or the organization with the ID 
//                   ${props.params.orgSlug} was not found.`}
//               </Typography>
//               {user ? (
//                 <Link
//                   href="/orgs"
//                   className={buttonVariants({
//                     className: "mt-2",
//                   })}
//                 >
//                   Return to your organizations
//                 </Link>
//               ) : (
//                 <Link
//                   href="/auth/signin"
//                   className={buttonVariants({
//                     className: "mt-2",
//                   })}
//                 >
//                   Sign in
//                 </Link>
//               )}
//             </div>
//           </Alert>
//         </Layout>
//       </NavigationWrapper>
//     );
//   }

//   return (
//     <Suspense fallback={<LoadingFallback />}>
//       <OrgNavigation>
//         <Suspense fallback={<LoadingFallback />}>
//           {props.children}
//         </Suspense>
//       </OrgNavigation>
//     </Suspense>
//   );
// }
