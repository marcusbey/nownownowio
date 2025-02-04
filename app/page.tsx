import { auth } from "@/lib/auth/helper";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();
  
  // If user is logged in, redirect to their org's page
  if (session?.user) {
    redirect("/orgs");
  }
  
  // Otherwise redirect to landing page
  redirect("/");
}
