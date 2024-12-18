"use client";

import { ORGANIZATION_LINKS } from "@/app/orgs/[orgSlug]/(navigation)/_navigation/org-navigation.links";
import { LogoSvg } from "@/components/svg/LogoSvg";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Typography } from "@/components/ui/typography";
import { ArrowUpCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { ReactNode, useEffect, useState, useMemo, useCallback } from "react";
import { ThemeToggle } from "../theme/ThemeToggle";
import { MobileBottomMenu } from "./MobileBottomMenu";

interface NavigationWrapperProps {
  children: ReactNode;
  logoChildren?: ReactNode;
  navigationChildren?: ReactNode;
  bottomNavigationCardChildren?: ReactNode;
  bottomNavigationChildren?: ReactNode;
  rightSideBar?: ReactNode;
  topBarChildren?: ReactNode;
}

export function NavigationWrapper({
  children,
  logoChildren,
  navigationChildren,
  bottomNavigationCardChildren,
  bottomNavigationChildren,
  rightSideBar,
}: NavigationWrapperProps) {
  const pathname = usePathname();
  const [hideSidebar, setHideSidebar] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const getRoutesWithoutSidebar = useMemo(() => {
    const settingsSection = ORGANIZATION_LINKS.find(
      (section) => section.title === "SETTINGS",
    );
    return settingsSection?.links.map((link) => link.href) || [];
  }, []);

  const getOrgSlugFromPath = useCallback((path: string): string => {
    const parts = path.split("/");
    const orgIndex = parts.findIndex((part) => part === "orgs");
    return orgIndex !== -1 && parts.length > orgIndex + 1
      ? parts[orgIndex + 1]
      : "";
  }, []);

  const shouldHideSidebar = useCallback((routes: string[]) => {
    return routes.some((route) => {
      const normalizedRoute = route.replace(
        ":organizationSlug",
        getOrgSlugFromPath(pathname),
      );
      return pathname.startsWith(normalizedRoute.replace(/\/+/g, "/"));
    });
  }, [pathname, getOrgSlugFromPath]);

  useEffect(() => {
    if (!pathname) return;
    const routes = getRoutesWithoutSidebar;
    const shouldHide = shouldHideSidebar(routes);
    setHideSidebar(shouldHide);
  }, [pathname, getRoutesWithoutSidebar, shouldHideSidebar]);

  // Prevent navigation while form is dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isNavigating) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isNavigating]);

  const handleNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  useEffect(() => {
    handleNavigation();
  }, [pathname, handleNavigation]);

  const gridCols = hideSidebar
    ? "grid-cols-[1fr] sm:grid-cols-[1fr] md:grid-cols-[1fr] lg:grid-cols-[1fr_3fr]"
    : "grid-cols-[1fr] sm:grid-cols-[20%_60%_20%] md:grid-cols-[25%_50%_25%] lg:grid-cols-[1fr_3fr_2fr]";

  return (
    <div className={`mx-auto grid min-h-screen w-full max-w-7xl ${gridCols}`}>
      {/* Left Sidebar */}
      <div
        className={`hidden border-r bg-muted/40 ${hideSidebar ? "lg:block" : "sm:block"}`}
      >
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
            {bottomNavigationChildren}
            <ThemeToggle />
          </div>
          <div className="mt-auto hidden p-4 sm:block">
            {bottomNavigationCardChildren}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {!hideSidebar && (
          <div className="sticky top-0 hidden h-screen w-64 flex-col border-r bg-background lg:flex">
            <div className="flex h-14 items-center gap-2 border-b px-4">
              <Button variant="ghost" asChild className="gap-2 px-2">
                {logoChildren || (
                  <>
                    <LogoSvg className="size-8" />
                    <Typography variant="h4">Nownownow</Typography>
                  </>
                )}
              </Button>
            </div>
            <div className="flex-1 px-2">{navigationChildren}</div>
            <div className="flex flex-col items-start gap-2 p-4">
              {bottomNavigationChildren}
              <ThemeToggle />
            </div>
            <div className="mt-auto hidden p-4 sm:block">
              {bottomNavigationCardChildren}
            </div>
          </div>
        )}
        <main className="flex flex-1 flex-col gap-4 overflow-auto px-4 md:gap-6 md:px-6 no-scrollbar">
          {children}
        </main>
        {/* Mobile Bottom Navigation */}
        <nav className="flex items-center justify-around border-t border-border p-2 sm:hidden">
          <MobileBottomMenu />
        </nav>
      </div>

      {/* Right Sidebar */}
      {!hideSidebar && rightSideBar && (
        <div className="hidden border-l bg-muted/40 lg:block">
          <div className="flex h-full max-h-screen flex-col px-6">
            {rightSideBar}
          </div>
        </div>
      )}
    </div>
  );
}
