import { motion, MotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { SiteConfig } from "../../site-config";

interface HeaderLogoProps {
  scrollYBoundedProgressDelayed: MotionValue<number>;
}

export function HeaderLogo({ scrollYBoundedProgressDelayed }: HeaderLogoProps) {
  return (
    <>
      <div className="flex items-center gap-1">
        <Link href="/" className="flex items-center gap-1 text-base font-bold">
          <motion.p
            style={{
              scale: useTransform(
                scrollYBoundedProgressDelayed,
                [0, 1],
                [1, 0.9],
              ),
            }}
            className="flex origin-left items-center text-xl font-semibold uppercase max-sm:hidden"
          >
            N
          </motion.p>
          <Image
            src={SiteConfig.appIcon}
            alt="app logo"
            width={32}
            height={32}
          />
          <motion.p
            style={{
              scale: useTransform(
                scrollYBoundedProgressDelayed,
                [0, 1],
                [1, 0.9],
              ),
            }}
            className="flex origin-left items-center text-xl font-semibold uppercase max-sm:hidden"
          >
            WNOWNOW
          </motion.p>
        </Link>
      </div>
    </>
  );
}
