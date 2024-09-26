import { LogoSvg } from "@/components/svg/LogoSvg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Typography } from "@/components/ui/typography";
import { ArrowUpCircle } from "lucide-react";
import { ReactNode } from "react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { MobileBottomMenu } from "./MobileBottomMenu";

interface NavigationWrapperProps {
  children: ReactNode;
  logoChildren?: ReactNode;
  navigationChildren?: ReactNode;
  bottomNavigationCardChildren?: ReactNode;
  buttomNavigationChildren?: ReactNode;
  rightSideBar?: ReactNode;
  hideSidebar?: boolean;
  topBarChildren?: ReactNode;
}

export function NavigationWrapper({
  children,
  logoChildren,
  navigationChildren,
  bottomNavigationCardChildren,
  buttomNavigationChildren,
  rightSideBar,
  hideSidebar = false,
  // topBarChildren,
}: NavigationWrapperProps) {
  const gridCols = hideSidebar
    ? "grid-cols-[1fr_3fr]" // 1/4 - 3/4 layout
    : "grid-cols-[1fr_2fr_1fr]"; // 1/4 - 2/4 - 1/4 layout

  return (
    <div className={`grid min-h-screen w-full ${gridCols} gap-4`}>
      {/* Left Sidebar */}
      <div className="hidden border-r bg-muted/40 lg:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center gap-2 border-b px-4 lg:h-[60px] lg:px-6">
            <LogoSvg size={32} />
            <Typography variant="large" className="font-mono">
              /
            </Typography>
            {logoChildren}
          </div>
          <div className="flex-1 px-2">{navigationChildren}</div>
          <div className="flex flex-col items-start gap-2 p-4">
            {buttomNavigationChildren}
            <ThemeToggle />
          </div>
          <div className="mt-auto hidden p-4 sm:block">
            {bottomNavigationCardChildren}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b border-border p-4 sm:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <div className="flex cursor-pointer items-center">
                {logoChildren}
              </div>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px]">
              {navigationChildren}
            </SheetContent>
          </Sheet>
          <LogoSvg size={32} />
          <Button size="sm" variant="secondary" className="aspect-square p-2">
            <ArrowUpCircle size={24} />
          </Button>
        </header>
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6">
          {children}
        </main>
        {/* Mobile Bottom Navigation */}
        <nav className="flex items-center justify-around border-t border-border p-2 sm:hidden">
          <MobileBottomMenu />
        </nav>
      </div>

      {/* Right Sidebar */}
      {!hideSidebar && rightSideBar && (
        <div className="border-l bg-muted/40">
          <div className="flex h-full max-h-screen flex-col px-6">
            {rightSideBar}
          </div>
        </div>
      )}
    </div>
  );
}
