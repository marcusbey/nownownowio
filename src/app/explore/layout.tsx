import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore | GoNow",
  description: "Explore people, posts, and topics on GoNow",
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
