'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { MailCheck, CheckCircle2, Send, Loader2 } from "lucide-react";
import { useState } from "react";
import { ActionError } from "@/lib/actions/safe-actions";
import { resendVerificationEmail } from "./resend.action";
import { useToast } from "@/components/ui/use-toast";

type ToastState = 'success' | 'error' | 'loading' | null;

const ANIMATION_DURATION = 2000; // 2 seconds for the success state

type VerifyRequestFormProps = {
  email: string;
}

export function VerifyRequestForm({ email }: VerifyRequestFormProps) {
  const [isResending, setIsResending] = useState(false);
  const [toastState, setToastState] = useState<ToastState>(null);
  const { toast } = useToast();

  const handleResendEmail = async () => {
    if (isResending) return;

    setIsResending(true);
    setToastState('loading');

    try {
      const result = await resendVerificationEmail({ parsedInput: { email } });
      
      if (result.success) {
        setToastState('success');
        toast({
          title: "Email Sent!",
          description: "Check your inbox for the verification link.",
        });
        
        // Reset after animation duration
        setTimeout(() => {
          setToastState(null);
          setIsResending(false);
        }, ANIMATION_DURATION);
      }
    } catch (error) {
      setToastState('error');
      toast({
        variant: "destructive",
        title: "Failed to send email",
        description: error instanceof ActionError ? error.message : "Please try again later.",
      });
      
      // Reset error state after a short delay
      setTimeout(() => {
        setToastState(null);
        setIsResending(false);
      }, 1000);
    }
  };

  return (
    <Card className="w-full max-w-md border-2 shadow-lg">
      <CardHeader className="space-y-4 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10">
          <MailCheck className="size-8 animate-pulse text-primary" />
        </div>
        <div className="space-y-2">
          <CardTitle className="!mt-0 text-2xl font-bold">
            Check Your Email!
          </CardTitle>
          <CardDescription className="text-base">
            We've sent a verification link to {email}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Typography variant="p" className="text-center text-sm text-muted-foreground">
          Click the link in the email to verify your account. If you don't see it, check your spam folder.
        </Typography>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="relative w-full overflow-hidden"
          onClick={handleResendEmail}
          disabled={isResending}
        >
          <div className="flex items-center justify-center gap-2">
            {toastState === 'loading' ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : toastState === 'success' ? (
              <>
                <CheckCircle2 className="size-4 text-green-500" />
                Sent!
              </>
            ) : (
              <>
                <Send className="size-4" />
                Resend verification email
              </>
            )}
          </div>
          {toastState === 'loading' && (
            <div
              className="absolute bottom-0 left-0 h-1 bg-primary"
              style={{
                width: '100%',
                animation: `progress ${ANIMATION_DURATION}ms linear`,
              }}
            />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
