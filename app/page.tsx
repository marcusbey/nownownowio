import { handleAuthRedirect } from "@/lib/auth/redirects";
import LandingPage from "./landing/LandingPage";

export default async function HomePage() {
  const redirectResult = await handleAuthRedirect();
  if (redirectResult) {
    return redirectResult;
  }
  return <LandingPage />;
}
