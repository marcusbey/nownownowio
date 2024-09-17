import type { PageParams } from "@/types/next";
import { SignUpDialog } from "../signup/SignUpDialog";

export default async function RoutePage(props: PageParams<{}>) {
  return <SignUpDialog />;
}
