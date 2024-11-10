import { TailwindIndicator } from "@/components/utils/TailwindIndicator";
import { FloatingLegalFooter } from "@/features/legal/FloatingLegalFooter";
import { NextTopLoader } from "@/features/page/NextTopLoader";
import { getServerUrl } from "@/lib/server-url";
import { cn } from "@/lib/utils";
import { SiteConfig } from "@/site-config";
import type { LayoutParams } from "@/types/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import PlausibleProvider from "next-plausible";
import type { ReactNode } from "react";
import "./code-theme.scss";
import "./globals.scss";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: SiteConfig.title,
  description: SiteConfig.description,
  metadataBase: new URL(getServerUrl()),
};

export default function RootLayout({
  children,
  modal,
}: LayoutParams & { modal: ReactNode }) {
  return (
    <>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <head>
          <PlausibleProvider domain={SiteConfig.domain} />
        </head>
        <body
          suppressHydrationWarning
          className={cn(
            "h-full bg-background font-sans antialiased relative",
            GeistMono.variable,
            GeistSans.variable,
          )}
        >
          <Providers>
            <div className="flex h-full flex-col">
              <NextTopLoader
                delay={100}
                showSpinner={false}
                color="hsl(var(--primary))"
              />
              {children}
              {modal}
            </div>
            <TailwindIndicator />
            <FloatingLegalFooter />
          </Providers>
          <script
            defer
            src="https://widget.nownownow.io/now-bundle.js"
            data-user-id="ErOeaXjKcLJ"
            data-token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJFck9lYVhqS2NMSiIsImlhdCI6MTcyNzU1MTA5NywiZXhwIjoxNzMwMTQzMDk3fQ.g7bQVdZ1vrZp1xJ_rpEXZzU73vemNV4fshZMHzJuqvE"
            data-theme="dark"
            data-position="left"
            data-button-color="yellow"
            data-button-size="90"
          ></script>
          <script
            defer
            data-website-id="671fb98a7acececdf6464e99"
            data-domain="nownownow.io"
            src="https://datafa.st/js/script.js"
          ></script>
        </body>
      </html>
    </>
  );
}
