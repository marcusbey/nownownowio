import { TailwindIndicator } from "@/components/data-display/tailwind-indicator";
import { NextTopLoader } from "@/features/core/next-top-loader";
import { auth } from "@/lib/auth/helper";
import { logger } from "@/lib/logger";
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

export default async function RootLayout({
  children,
  modal,
}: LayoutParams & { modal?: ReactNode }) {
  // Debug auth state at the root level
  const session = await auth();
  logger.debug("[RootLayout] Server-side session:", {
    hasSession: !!session,
    userId: session?.id,
    userEmail: session?.email,
  });

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
          <script
            defer
            type="module"
            src="http://localhost:5173/dist/now-widget.js"
            now-data-org-id="67tiEuEkC3G"
            now-data-token="Njd0aUV1RWtDM0cuMTc0MjE1NDU0NTE3OC5kZWZhdWx0LXdpZGdldC1zZWNyZXQ="
            now-data-theme="dark"
            now-data-position="left"
            now-data-button-color="#1a73e8"
            now-data-button-size="90"
          ></script>
        </body>
      </html>
    </>
  );
}
