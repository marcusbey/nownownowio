import type { PageParams } from "@/types/next";
import { SignUpDialog } from "./SignUpDialog";

export default async function RoutePage(props: PageParams) {
  return <SignUpDialog />;
}
