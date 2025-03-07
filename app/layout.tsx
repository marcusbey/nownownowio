import { TailwindIndicator } from "@/components/data-display/tailwind-indicator";
import { NextTopLoader } from "@/features/core/next-top-loader";
import { getServerUrl } from "@/lib/server-url";
import { cn } from "@/lib/utils";
import { SiteConfig } from "@/site-config";
import type { LayoutParams } from "@/types/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.scss";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: SiteConfig.title,
  description: SiteConfig.description,
  metadataBase: new URL(getServerUrl()),
};

const CaptionFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-caption",
});

export default function RootLayout({
  children,
  modal,
}: LayoutParams & { modal?: ReactNode }) {
  return (
    <>
      <html lang="en" className="h-full" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          className={cn(
            "h-full bg-background font-sans antialiased",
            GeistMono.variable,
            GeistSans.variable,
            CaptionFont.variable,
          )}
        >
          <Providers>
            <NextTopLoader
              delay={100}
              showSpinner={false}
              color="hsl(var(--primary))"
            />
            {children}
            {modal}
            <TailwindIndicator />
          </Providers>
          <script
          defer
          data-domain="nownownow.io"
          src="https://datafa.st/js/script.js"
        />
        <script defer src="http://localhost:5173/dist/now-widget.js" data-user-id="Ng1D9LbmlQL" data-token="TmcxRDlMYm1sUUwuMTc0MTMxNjEwMzU5Ni53aWRnZXQtdG9rZW4=" data-theme="dark" data-position="left" data-button-color="#1a73e8" data-button-size="90"></script>
        </body>
      </html>
    </>
  );
}
