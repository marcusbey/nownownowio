"use client";

import { SignInProviders } from "@/app/auth/signin/SignInProviders";
import { LogoSvg } from "@/components/svg/LogoSvg";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePathname, useRouter } from "next/navigation";

export function SignInDialog() {
  const router = useRouter();
  const path = usePathname();

  return (
    <Dialog
      open={path?.startsWith("/auth/signin") ?? false}
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
      modal={true}
    >
      <DialogContent className="bg-card" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader className="flex flex-col items-center justify-center gap-2">
          <LogoSvg />
          <DialogTitle>Sign in to your account</DialogTitle>
          <DialogDescription>
            Enter your credentials to access your account
          </DialogDescription>
        </DialogHeader>
        <SignInProviders />
      </DialogContent>
    </Dialog>
  );
}
