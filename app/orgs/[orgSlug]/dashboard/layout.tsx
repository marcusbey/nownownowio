import { Tabs, TabsList, TabsTrigger } from "@/components/data-display/tabs";
import { RightSidebar } from "@/features/layout/right-sidebar";
import { NavigationLinks } from "@/features/navigation/navigation-links";
import { PostFormWrapper } from "../(navigation)/post-form-wrapper";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="sticky top-0 h-screen w-64 shrink-0 border-r border-border bg-card">
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 p-4">
            <div className="flex size-8 items-center justify-center rounded-full bg-yellow-500 font-medium text-background">
              R
            </div>
            <span>romainboboe</span>
          </div>
          <NavigationLinks
            links={[
              {
                href: "/",
                label: "Home",
              },
              {
                href: "/dashboard",
                label: "Dashboard",
              },
              {
                href: "/settings",
                label: "Settings",
              },
            ]}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-8">
          {/* Post Form */}
          <div className="px-4">
            <PostFormWrapper
              organization={{ id: "1", name: "romainboboe" }}
              userId="1"
            />
          </div>

          {/* Tabs */}
          <div className="mt-8">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Main Content */}
          <div className="mt-8">{children}</div>
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar>
        <div className="space-y-4">
          <h3 className="font-medium">Recent Activity</h3>
          {/* Add activity content here */}
        </div>
      </RightSidebar>
    </div>
  );
}
