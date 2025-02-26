import { AuthButton } from "@/features/core/auth/auth-button";
import { HeaderBase } from "./header-base";

export function Header() {
  return (
    <HeaderBase>
      <AuthButton />
    </HeaderBase>
  );
}
