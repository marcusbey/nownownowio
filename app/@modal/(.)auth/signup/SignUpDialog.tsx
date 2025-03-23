"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/composite/dialog";
import { Typography } from "@/components/data-display/typography";
import { LogoSvg } from "@/components/icons/logo-svg";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignUpCredentialsForm } from "../../../auth/signup/sign-up-credentials-form";

export function SignUpDialog() {
  const router = useRouter();
  const path = usePathname();

  return (
    <Dialog
      open={path.startsWith("/auth/signup")}
      onOpenChange={(open) => {
        if (!open) {
          // Force immediate close without validation
          router.back();
        }
      }}
    >
      <DialogContent
        className="bg-card mx-auto w-[95%] max-w-md"
        onOpenAutoFocus={(e) => e.preventDefault()}
        // Disable default escape key handling and handle it ourselves
        onEscapeKeyDown={(e) => {
          e.preventDefault();
          router.back();
        }}
        // Disable default overlay click handling and handle it ourselves
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="flex flex-col items-center justify-center gap-2">
          <LogoSvg />
          <DialogTitle>Join today</DialogTitle>
          <DialogDescription className="text-center">
            Create your account to get started with NowNowNow
          </DialogDescription>
        </DialogHeader>
        <SignUpCredentialsForm />
        <Typography variant="small" className="mt-8 flex justify-center">
          You already have an account?{" "}
          <Typography
            variant="link"
            as={Link}
            href="/auth/signin"
            className="pl-2"
          >
            Sign in
          </Typography>
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
