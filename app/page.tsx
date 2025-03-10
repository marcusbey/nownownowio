import LandingPage from "./landing/LandingPage";
import { handleAuthRedirect } from "@/lib/auth/redirects";

export default async function HomePage() {
  const redirectResult = await handleAuthRedirect();
  if (redirectResult) {
    return redirectResult;
  }
  return <LandingPage />;
}