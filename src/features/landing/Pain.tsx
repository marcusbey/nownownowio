"use client";

import { Typography } from "@/components/ui/typography";
import { SectionLayout } from "./SectionLayout";

export const PainSection = () => {
  return (
    <SectionLayout
      variant="card"
      size="base"
      className="flex flex-col items-center justify-center gap-4"
    >
      <div className="flex w-full flex-col items-center gap-3 lg:gap-4 xl:gap-6">
        <Typography variant="h1">Keeping Your Site Up-to-Date...</Typography>
        <Typography variant="large">
          Your deployment page shouldn't be a static wasteland of outdated information
        </Typography>
        <div className="flex items-start gap-4 max-lg:flex-col">
          <div className="flex-1 rounded-lg bg-red-500/20 p-4 lg:p-6">
            <Typography variant="h3" className="text-red-500">
              😞 Static Deployment Pages
            </Typography>
            <ul className="ml-4 mt-4 flex list-disc flex-col gap-2 text-lg text-foreground/80">
              <li>Outdated status information</li>
              <li>Manual deployment updates</li>
              <li>No real-time progress tracking</li>
              <li>Users left guessing about changes</li>
            </ul>
          </div>
          <div className="flex-1 rounded-lg bg-green-500/20 p-4 lg:p-6">
            <Typography variant="h3" className="text-green-500">
              😎 Dynamic with NowNowNow
            </Typography>
            <ul className="ml-4 mt-4 flex list-disc flex-col gap-2 text-lg text-foreground/80">
              <li>Live deployment status updates</li>
              <li>Real-time feature rollouts</li>
              <li>Automated changelog generation</li>
              <li>Users always in the loop</li>
            </ul>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
};
