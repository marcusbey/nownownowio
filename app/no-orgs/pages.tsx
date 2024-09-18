import AuthNavigationWrapper from "@/features/navigation/LogInNavigationWrapper";
import {
  Layout,
  LayoutContent,
  LayoutDescription,
  LayoutHeader,
  LayoutTitle,
} from "@/features/page/layout";

export default function NoOrganizationPage() {
  return (
    <AuthNavigationWrapper>
      <Layout>
        <LayoutHeader>
          <LayoutTitle>No Organization Available</LayoutTitle>
          <LayoutDescription>
            You currently don't have an organization, and new organization
            creation is disabled.
          </LayoutDescription>
        </LayoutHeader>
        <LayoutContent>
          <AddProjectForm />
        </LayoutContent>
      </Layout>
    </AuthNavigationWrapper>
  );
}
