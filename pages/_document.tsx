import type { DocumentProps } from "next/document";
import { Head, Html, Main, NextScript } from "next/document";

export default function Document(props) {
  return (
    <Html lang="en">
      <Head />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
