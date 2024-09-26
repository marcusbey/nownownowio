import { Head, Html, NextScript } from "next/document";

// @ts-ignore
export default function RootLayout({ children }) {
  return (
    <Html>
      <Head />
      <body>
        {children}
        <NextScript />
      </body>
    </Html>
  );
}
