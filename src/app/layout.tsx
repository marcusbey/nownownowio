import "@/styles/globals.css";
import { Inter } from "next/font/google";
import { Metadata } from "next";
import NavigationWrapper from "@/features/navigation/NavigationWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "GoNow",
  description: "Share what's happening now",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationWrapper>{children}</NavigationWrapper>
      </body>
    </html>
  );
}
