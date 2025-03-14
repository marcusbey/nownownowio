import type { Metadata } from "next";

type Props = {
  searchParams: { q?: string };
}

export function generateMetadata({ searchParams: { q } }: Props): Metadata {
  return {
    title: q ? `Search results for "${q}"` : "Explore",
  };
}
