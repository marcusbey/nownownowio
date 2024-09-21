import { LogoSvg } from "@/components/svg/LogoSvg";
import { Typography } from "@/components/ui/typography";
import { ReactNode } from "react";
import { ThemeToggle } from "../theme/ThemeToggle";

export async function NavigationWrapper({
  children,
  logoChildren,
  navigationChildren,
  bottomNavigationCardChildren,
  buttomNavigationChildren,
  rightSideBar,
  // topBarChildren,
}: {
  children: ReactNode;
  logoChildren?: ReactNode;
  navigationChildren?: ReactNode;
  bottomNavigationCardChildren?: ReactNode;
  topBarChildren?: ReactNode;
  buttomNavigationChildren?: ReactNode;
  rightSideBar?: ReactNode;
}) {
  return (
    <div className="grid min-h-screen w-full grid-cols-[1fr] sm:grid-cols-[20%_80%] md:grid-cols-[33.33%_66.67%] lg:grid-cols-[1fr_2fr_1fr]">
      <div className="hidden border-r bg-muted/40 sm:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center gap-2 border-b px-4 lg:h-[60px] lg:px-6">
            <LogoSvg size={32} />
            <Typography variant="large" className="font-mono">
              /
            </Typography>
            {logoChildren}
          </div>
          <div className="flex-1">{navigationChildren}</div>
          <div className="flex items-center gap-2">
            {buttomNavigationChildren}
            <ThemeToggle />
          </div>
          <div className="mt-auto p-4">{bottomNavigationCardChildren}</div>
        </div>
      </div>
      <div className="flex max-h-screen flex-col">
        <main className="flex flex-1 flex-col gap-4 overflow-auto p-4 md:gap-6 md:p-6">
          {children}
        </main>
      </div>
      <div className="hidden border-l bg-muted/40 lg:block">
        <div className="flex h-full max-h-screen flex-col px-6">
          {rightSideBar}
        </div>
      </div>
    </div>
  );
}
