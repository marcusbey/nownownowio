import { Metadata } from "next";

interface Props {
  searchParams: { q?: string };
}

export function generateMetadata({ searchParams: { q } }: Props): Metadata {
  return {
    title: q ? `Search results for "${q}"` : "Explore",
  };
}
