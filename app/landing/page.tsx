import { auth } from "@/lib/auth/helper";
import { redirect } from "next/navigation";
import LandingPage from "../page";

export default async function LandingPage() {
  const user = await auth();

  if (user) {
    redirect("/home");
  }
  return <LandingPage />;
}
