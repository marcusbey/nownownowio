"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/composite/dialog";
import { LogoSvg } from "@/components/icons/logo-svg";
import { usePathname, useRouter } from "next/navigation";
import { SignInProviders } from "../../../auth/signin/sign-in-providers";

export function SignInDialog() {
  const router = useRouter();
  const path = usePathname();

  return (
    <Dialog
      open={path.startsWith("/auth/signin")}
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
      modal={true}
    >
      <DialogContent
        className="bg-card"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
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
