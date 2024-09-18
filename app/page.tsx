import { auth } from "@/lib/auth/helper";
import { redirect } from "next/navigation";
import LandingPage from "./landing/LandingPage";

export default async function HomePage() {
  const user = await auth();

  if (user) {
    redirect("/home");
  }
  return <LandingPage />;
}
