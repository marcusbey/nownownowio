"use client";

import { BentoGrid, BentoGridItem } from "@/components/data-display/bentoo";
import { Typography } from "@/components/data-display/typography";
import { cn } from "@/lib/utils";
import { motion, type Variants } from "framer-motion";
import {
  Activity,
  Building2,
  Globe2,
  Lock,
  MessageSquare,
  Share2,
  Users2,
  Zap,
  Code2,
  Sparkles,
  CheckCircle,
  Calendar,
  CalendarCheck,
  BarChart3,
  X,
} from "lucide-react";
import { Alert, AlertTitle } from "@/components/feedback/alert";
import { Loader } from "@/components/feedback/loader";
import { SectionLayout } from "./SectionLayout";

const features = [
  {
    title: "Organization Spaces",
    description:
      "Create branded spaces for your team with custom domains and full control over member access.",
    icon: Building2,
    className: "md:col-span-2",
    color: "bg-blue-500/10",
    textColor: "text-blue-500",
  },
  {
    title: "Widget Integration",
    description:
      "Embed your posts on any website with our lightweight widget. Share your content everywhere.",
    icon: Code2,
    className: "md:col-span-2",
    color: "bg-purple-500/10",
    textColor: "text-purple-500",
  },
  {
    title: "Social Interactions",
    description: "Engage with posts, comments, and reactions in real-time.",
    icon: Share2,
    color: "bg-green-500/10",
    textColor: "text-green-500",
  },
  {
    title: "Media Sharing",
    description: "Share images, videos, and files seamlessly.",
    icon: Globe2,
    color: "bg-yellow-500/10",
    textColor: "text-yellow-500",
  },
  {
    title: "Real-time Updates",
    description: "Stay informed with instant notifications and live feeds.",
    icon: Activity,
    color: "bg-red-500/10",
    textColor: "text-red-500",
  },
  {
    title: "Enterprise Security",
    description: "Role-based access control and data encryption for peace of mind.",
    icon: Lock,
    className: "md:col-span-2",
    color: "bg-indigo-500/10",
    textColor: "text-indigo-500",
  },
];

export function BentoSection() {
  return (
    <section className="relative overflow-hidden bg-slate-950 py-24">
      <div className="container relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" className="mb-4 text-white">
              Everything You Need
            </Typography>
            <Typography className="mb-8 text-slate-400">
              A complete platform for your organization's social presence,
              with powerful features and seamless integrations.
            </Typography>
          </motion.div>
        </div>

        <div className="mt-16">
          <BentoGrid>
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <BentoGridItem
                  className={cn(
                    "group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl transition-all hover:border-slate-700",
                    feature.className
                  )}
                  title={feature.title}
                  description={feature.description}
                  icon={
                    <div
                      className={cn(
                        "mb-4 inline-flex rounded-lg p-3",
                        feature.color
                      )}
                    >
                      <feature.icon
                        className={cn("h-6 w-6", feature.textColor)}
                      />
                    </div>
                  }
                />
              </motion.div>
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  );
}

const Skeleton1 = () => {
  const variants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex h-full flex-col gap-2"
    >
      <motion.div className="flex flex-row items-start gap-2 rounded-2xl border border-border bg-background p-3">
        <img
          alt="avatar"
          src="https://melvynx.com/_next/image?url=%2Fimages%2Fmy-face.png&w=828&q=75"
          className="size-6 shrink-0 rounded-full"
        />
        <div>
          <p className="text-xs text-neutral-500">
            Create a Thread to announce Now.ts
          </p>
        </div>
      </motion.div>
      <motion.div
        variants={variants}
        className="flex flex-row items-start justify-end gap-2 rounded-2xl border border-border bg-background p-3"
      >
        <p className="text-xs text-neutral-500">
          Today I announced my new project, Now.TS, the perfect way to create
          professional Next.js application in days.
        </p>
        <div className="size-6 shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
      </motion.div>
    </motion.div>
  );
};

const Skeleton2 = () => {
  const variants: Variants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
  };
  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex h-full flex-col gap-2"
    >
      <motion.div>
        <Alert variant="default" className="">
          <Loader size={20} />
          <AlertTitle>Schedule your threads...</AlertTitle>
        </Alert>
      </motion.div>
      <motion.div variants={variants}>
        <Alert variant="success" className="">
          <CheckCircle size={20} />
          <AlertTitle>Your threads are now scheduled for 7:00 AM</AlertTitle>
        </Alert>
      </motion.div>
    </motion.div>
  );
};

const Skeleton3 = () => {
  const variants = {
    initial: {
      backgroundPosition: "0 50%",
    },
    animate: {
      backgroundPosition: ["0, 50%", "100% 50%", "0 50%"],
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants}
      transition={{
        duration: 5,
        repeat: Infinity,
        repeatType: "reverse",
      }}
      className="dark:bg-dot-white/[0.2] bg-dot-black/[0.2] flex size-full min-h-24 flex-1 flex-col space-y-2 rounded-lg"
      style={{
        background:
          "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
        backgroundSize: "400% 400%",
      }}
    >
      <motion.div className="size-full rounded-lg"></motion.div>
    </motion.div>
  );
};

const Skeleton4 = () => {
  const first = {
    initial: {
      x: 20,
      rotate: -5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  const second = {
    initial: {
      x: -20,
      rotate: 5,
    },
    hover: {
      x: 0,
      rotate: 0,
    },
  };
  return (
    <motion.div
      initial="initial"
      animate="animate"
      whileHover="hover"
      className="flex flex-1 flex-row gap-4"
    >
      <motion.div
        variants={first}
        className="flex h-full w-1/3 flex-col items-center justify-center rounded-2xl border border-border bg-background p-4"
      >
        <Typography variant="large">+123 followers</Typography>
        <Typography variant={"muted"}>In the last 30 days</Typography>
        <Typography variant={"muted"} className="text-green-500">
          +12%
        </Typography>
      </motion.div>
      <motion.div className="flex h-full w-1/3 flex-col items-center justify-center rounded-2xl border border-border bg-background p-4">
        <Typography variant="large">+1.4 M Views</Typography>
        <Typography variant={"muted"}>In the last 30 days</Typography>
        <Typography variant={"muted"} className="text-green-500">
          +21%
        </Typography>
      </motion.div>
      <motion.div
        variants={second}
        className="flex h-full w-1/3 flex-col items-center justify-center rounded-2xl border border-border bg-background p-4"
      >
        <Typography variant="large">1244 likes</Typography>
        <Typography variant="large">766 replis</Typography>
        <Typography variant={"muted"}>In the last 30 days</Typography>
        <Typography variant={"muted"} className="text-green-500">
          +12%
        </Typography>
      </motion.div>
    </motion.div>
  );
};

const Skeleton5 = () => {
  const variants = {
    initial: {
      x: 0,
    },
    animate: {
      x: 10,
      rotate: 5,
      transition: {
        duration: 0.2,
      },
    },
  };
  const variantsSecond = {
    initial: {
      x: 0,
    },
    animate: {
      x: -10,
      rotate: -5,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      initial="initial"
      whileHover="animate"
      className="flex flex-col gap-2"
    >
      <motion.div
        variants={variants}
        className="flex flex-row items-start gap-2 rounded-2xl border border-border bg-background p-3"
      >
        <img
          src="https://melvynx.com/_next/image?url=%2Fimages%2Fmy-face.png&w=828&q=75"
          alt="avatar"
          height="100"
          width="100"
          className="size-10 rounded-full"
        />
        <p className="text-xs text-neutral-500">
          What I need to do to get more followers ?
        </p>
      </motion.div>
      <motion.div
        variants={variantsSecond}
        className="flex flex-row items-start justify-end gap-2 rounded-2xl border border-border bg-background p-3"
      >
        <div>
          <p className="text-xs text-neutral-500">Searching...</p>
          <motion.p
            className="text-xs text-neutral-500"
            variants={{
              initial: {
                opacity: 0,
              },
              animate: {
                opacity: 1,
              },
            }}
          >
            Based on the Threads activity of the past 30 days, you should focus
            creating content on Next.js
          </motion.p>
        </div>
        <div className="size-6 shrink-0 rounded-full bg-gradient-to-r from-pink-500 to-violet-500" />
      </motion.div>
    </motion.div>
  );
};

const items = [
  {
    title: "AI Content Generation",
    description: (
      <span className="text-sm">
        Experience the power of AI in generating unique content.
      </span>
    ),
    header: <Skeleton1 />,
    className: "md:col-span-1",
    icon: <Sparkles size={20} />,
  },
  {
    title: "Schedule with ease",
    description: (
      <span className="text-sm">
        We help you schedule your threads with ease.
      </span>
    ),
    header: <Skeleton2 />,
    className: "md:col-span-1",
    icon: <Calendar size={20} />,
  },
  {
    title: "Calendar View",
    description: (
      <span className="text-sm">
        See what you have planned for the day with our calendar view.
      </span>
    ),
    header: <Skeleton3 />,
    className: "md:col-span-1",
    icon: <CalendarCheck size={20} />,
  },
  {
    title: "Threads Analysis",
    description: (
      <span className="text-sm">
        Understand your threads with our powerful analytics.
      </span>
    ),
    header: <Skeleton4 />,
    className: "md:col-span-2",
    icon: <BarChart3 size={20} />,
  },

  {
    title: "See what works",
    description: (
      <span className="text-sm">
        Understand the hype and trends with our powerful research tools.
      </span>
    ),
    header: <Skeleton5 />,
    className: "md:col-span-1",
    icon: <X className="size-4 text-neutral-500" />,
  },
];

export function BentoGridSection() {
  return (
    <SectionLayout>
      <BentoGrid className="mx-auto max-w-4xl md:auto-rows-[20rem]">
        {items.map((item, i) => (
          <BentoGridItem
            key={i}
            title={item.title}
            description={item.description}
            header={item.header}
            className={cn("[&>p:text-lg]", item.className)}
            icon={item.icon}
          />
        ))}
      </BentoGrid>
    </SectionLayout>
  );
}
