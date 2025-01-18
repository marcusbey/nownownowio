import { auth } from "@/lib/auth/helper";
import { LoggedInButton, SignInButton } from "./SignInButton";

export const AuthButton = async () => {
  const session = await auth();

  if (session?.user) {
    return <LoggedInButton user={session.user} />;
  }

  return <SignInButton />;
};
