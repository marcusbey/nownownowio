import logo from "@/public/images/icon.png";
import config from "@/config";
import Image from "next/image";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="border border-border bg-card">
      <div className="mx-auto max-w-7xl px-8 py-24">
        <div className=" flex flex-col flex-wrap md:flex-row md:flex-nowrap lg:items-start">
          <div className="mx-auto w-64 shrink-0 text-center md:mx-0 md:text-left">
            <Link
              href="/#"
              aria-current="page"
              className="flex items-center justify-center gap-2 md:justify-start"
            >
              <Image
                src={logo}
                alt={`${config.appName} logo`}
                priority={true}
                className="size-6"
                width={24}
                height={24}
              />
              <strong className="text-base font-extrabold tracking-tight md:text-lg">
                {config.appName}
              </strong>
            </Link>

            <p className="text-base-content/80 mt-3 text-sm">
              {config.appDescription}
            </p>
            <p className="text-base-content/60 mt-3 text-sm">
              Copyright © {new Date().getFullYear()} - All rights reserved
            </p>
          </div>
          <div className="-mb-10 mt-10 flex grow flex-wrap justify-end text-center md:mt-0">
            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="footer-title text-base-content mb-3 text-sm font-semibold tracking-widest md:text-left">
                LINKS
              </div>

              <div className="mb-10 flex flex-col items-center justify-center gap-2 text-sm md:items-start">
                {config.mailgun.supportEmail && (
                  <a
                    href={`mailto:${config.mailgun.supportEmail}`}
                    target="_blank"
                    className="link link-hover"
                    aria-label="Contact Support"
                    rel="noreferrer"
                  >
                    Support
                  </a>
                )}
                <Link href="/#pricing" className="link link-hover">
                  Pricing
                </Link>
                <Link href="/blog" className="link link-hover">
                  Blog
                </Link>
                <a href="/#" target="_blank" className="link link-hover">
                  Affiliates
                </a>
              </div>
            </div>

            <div className="w-full px-4 md:w-1/2 lg:w-1/3">
              <div className="footer-title text-base-content mb-3 text-sm font-semibold tracking-widest md:text-left">
                LEGAL
              </div>

              <div className="mb-10 flex flex-col items-center justify-center gap-2 text-sm md:items-start">
                <Link href="/tos" className="link link-hover">
                  Terms of services
                </Link>
                <Link href="/privacy-policy" className="link link-hover">
                  Privacy policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
