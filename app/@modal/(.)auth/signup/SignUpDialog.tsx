"use client";

import { LogoSvg } from "@/components/svg/LogoSvg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Typography } from "@/components/ui/typography";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignUpCredentialsForm } from "../../../auth/signup/SignUpCredentialsForm";

export  function SignUpDialog() {
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
      // Prevent form submission on Escape key
      onEscapeKeyDown={(e) => {
        e.preventDefault();
        router.back();
      }}
      // Prevent form submission on overlay click
      onInteractOutside={(e) => {
        e.preventDefault();
        router.back();
      }}
    >
      <DialogContent className="bg-card" onOpenAutoFocus={(e) => e.preventDefault()}>
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
            <Typography variant="link" as={Link} href="/auth/signin" className="pl-2">
              Sign in
          </Typography>
        </Typography>
      </DialogContent>
    </Dialog> 
  );
}
