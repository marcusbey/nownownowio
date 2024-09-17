import { SignUpProviders } from "@/app/auth/signup/SignUpProviders";
import { CircleSvg } from "@/components/svg/CircleSvg";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth/helper";
import { cn } from "@/lib/utils";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { Typography } from "../../components/ui/typography";
import { ReviewSmall } from "./review/ReviewSmall";

export const Hero = async () => {
  const user = await auth();

  return (
    <main className="relative m-auto my-12 flex min-h-[700px] w-full max-w-7xl items-center gap-4 px-8 max-lg:flex-col">
      <div className="relative flex flex-1 flex-col items-start gap-4 lg:gap-6 xl:gap-8">
        <Typography variant="h1" className="!leading-tight">
          Build Trust, Boost Sales by Sharing your Progress{" "}
          <span className="inline-block -rotate-2 rounded bg-foreground px-2 py-1 text-background">
            in{" "}
            <span className="relative inline-block">
              <span className="font-bold">Real-Time</span>
              <CircleSvg className="animate-pulse fill-primary" />
            </span>
          </span>
        </Typography>
        <Typography variant="large">
          Captivate your audience with instant updates, turn casual visitors
          into loyal customers, and see your online presence grow.
        </Typography>
        <Link
          href="#pricing"
          className={cn(buttonVariants({ size: "lg", variant: "default" }))}
        >
          <Rocket size={20} className="mr-2" /> Join now
        </Link>
        <ReviewSmall
          stars={5}
          avatars={[
            "https://i.pravatar.cc/300?u=1",
            "https://i.pravatar.cc/300?u=2",
            "https://i.pravatar.cc/300?u=3",
            "https://i.pravatar.cc/300?u=4",
            "https://i.pravatar.cc/300?u=100",
          ]}
        >
          1222+ users write with it
        </ReviewSmall>
      </div>
      <div className="flex flex-1 justify-end">
        {!user && <SignUpProviders />}
      </div>
    </main>
  );
};
