import { NavigationLinks } from "@/features/navigation/navigation-links";
import { ORGANIZATION_LINKS } from "@/app/orgs/[orgSlug]/(navigation)/_navigation/org-navigation.links";
import { RightSidebar } from "@/features/layout/right-sidebar";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="w-64 shrink-0 border-r border-border h-screen sticky top-0 bg-card">
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center gap-2">
            <div className="size-8 rounded-full bg-yellow-500 flex items-center justify-center text-background font-medium">R</div>
            <span>romainboboe</span>
          </div>
          <NavigationLinks navigation={ORGANIZATION_LINKS} />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        <div className="max-w-3xl mx-auto">
          {/* Post Form */}
          <div className="p-4 border-b border-border">
            <div className="flex gap-3">
              <Avatar className="size-10">
                <div className="size-full rounded-full bg-yellow-500 flex items-center justify-center text-background font-medium">R</div>
              </Avatar>
              <div className="flex-1">
                <textarea
                  placeholder="What's crack-a-lackin'?"
                  className="w-full bg-card rounded-lg p-3 resize-none text-sm min-h-[80px]"
                />
                <div className="flex justify-end mt-2">
                  <Button className="bg-yellow-500 hover:bg-yellow-600">Post</Button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-4 border-b border-border">
            <Tabs defaultValue="for-you" className="w-full">
              <TabsList className="w-full justify-start h-12 p-0 bg-transparent">
                <TabsTrigger
                  value="for-you"
                  className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 rounded-none"
                >
                  For you
                </TabsTrigger>
                <TabsTrigger
                  value="following"
                  className="flex-1 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-yellow-500 rounded-none"
                >
                  Following
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Feed Content */}
          <div className="p-4">
            <div className="text-center text-muted-foreground py-8">
              No one has posted anything yet.
            </div>
          </div>
        </div>
      </main>

      {/* Right Sidebar */}
      <RightSidebar />
    </div>
  );
}
