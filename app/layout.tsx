import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { Metadata } from "next";
import { Suspense } from "react";
import { cn } from "@/lib/utils";
import "./code-theme.scss";
import "./globals.scss";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "NowNowNow - Modern Social Platform for Organizations",
  description: "Connect, share, and engage with your organization in real-time.",
};

const fontSans = GeistSans;
const fontMono = GeistMono;

export default function RootLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#000000" />
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
            <Suspense fallback={
              <div className="flex h-full items-center justify-center">
                <div className="animate-pulse">Loading...</div>
              </div>
            }>
              {children}
            </Suspense>
            <Suspense fallback={null}>
              {modal}
            </Suspense>
          </div>
        </Providers>
        <script
          defer
          data-domain="nownownow.io"
          src="https://datafa.st/js/script.js"
        />
        {process.env.NODE_ENV === 'development' ? (
          <script 
            defer
            type="module"
            src="http://localhost:5173/dist/now-widget.js" 
            data-user-id="OeoG_hDne0W" 
            data-token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJPZW9HX2hEbmUwVyIsImlhdCI6MTczNzY1ODQ1MiwiZXhwIjoxNzM3NzQ0ODUyfQ.cvLxlsllkFo1CX3SHZF0vtx3d0FvIt5p26S6nVYqBhY" 
            data-theme="dark" 
            data-position="left" 
            data-button-color="#1a348e" 
            data-button-size="90"
          />
        ) : (
          <script 
            defer 
            type="module"
            src="https://widget.nownownow.io/now-widget.js"
            data-user-id="OeoG_hDne0W" 
            data-token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJPZW9HX2hEbmUwVyIsImlhdCI6MTczNzY1ODQ1MiwiZXhwIjoxNzM3NzQ0ODUyfQ.cvLxlsllkFo1CX3SHZF0vtx3d0FvIt5p26S6nVYqBhY" 
            data-theme="dark" 
            data-position="left" 
            data-button-color="#1a348e" 
            data-button-size="90"
          />
        )}
      </body>
    </html>
  );
}
