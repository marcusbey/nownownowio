import LogInNavigationWrapper from "@/features/core/log-in-navigation-wrapper";
import { Page404 } from "@/features/core/page/page-404";

export default function NotFoundPage() {
  return (
    <LogInNavigationWrapper>
      <Page404 />
    </LogInNavigationWrapper>
  );
}
