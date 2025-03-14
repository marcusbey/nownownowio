"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, MailCheck, Send, Sparkles } from "lucide-react";
import { useState } from "react";
import { resendVerificationEmail } from "./resend.action";
import { SiteConfig } from "@/site-config";

type VerifyContentProps = {
  email: string;
}

export function VerifyContent({ email }: VerifyContentProps) {
  const [isResending, setIsResending] = useState(false);
  const [toastState, setToastState] = useState<'idle' | 'success' | 'error'>('idle');

  const handleResendEmail = async () => {
    if (!email || isResending) return;
    
    setIsResending(true);
    setToastState('idle');
    
    try {
      await resendVerificationEmail({ input: { email } });
      setToastState('success');
    } catch (error) {
      setToastState('error');
    } finally {
      setIsResending(false);
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
            We've sent a verification link to your email address.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        <div className="space-y-2 rounded-lg bg-muted/50 p-4">
          <p className="text-sm font-medium">What to do next:</p>
          <ol className="list-inside list-decimal space-y-2 text-left text-sm text-muted-foreground">
            <li>Open your email inbox</li>
            <li>Look for an email from {SiteConfig.title}</li>
            <li>Click the verification link in the email</li>
            <li>Return to {SiteConfig.title} to continue</li>
          </ol>
        </div>

        {toastState === 'success' && (
          <div className="flex items-center justify-center gap-2 text-sm text-primary">
            <Sparkles className="size-4" />
            <span>New verification email sent!</span>
          </div>
        )}
        {toastState === 'error' && (
          <div className="flex items-center justify-center gap-2 text-sm text-destructive">
            <Sparkles className="size-4" />
            <span>Failed to send email. Please try again.</span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <Button
          variant="outline"
          className={`relative w-full overflow-hidden transition-all duration-200 ${toastState === 'success' ? 'border-0 bg-green-500 text-white ring-0 ring-offset-0 hover:bg-green-600' : ''}`}
          onClick={handleResendEmail}
          disabled={isResending}
        >
          <div className={`flex w-full items-center justify-center gap-2 transition-transform duration-200 ${toastState === 'success' ? 'scale-0' : 'scale-100'}`}>
            {isResending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Sending verification email...</span>
              </>
            ) : (
              <>
                <Send className="size-4" />
                <span>Resend verification email</span>
              </>
            )}
          </div>
          
          {/* Success state overlay */}
          <div 
            className={`
              absolute inset-0 flex items-center justify-center gap-2
              transition-all duration-200
              ${toastState === 'success' ? 'scale-100' : 'scale-0'}
            `}
          >
            <CheckCircle2 className="size-4" />
            <span>Email sent successfully!</span>
          </div>

          {/* Progress bar */}
          <div 
            className={`
              absolute bottom-0 left-0 h-1 bg-primary
              transition-all duration-200 ease-out
              ${isResending ? 'opacity-100' : 'opacity-0'}
            `}
            style={{
              width: isResending ? '100%' : '0%',
              transitionDuration: '1000ms'
            }}
          />
        </Button>
        <p className="px-6 text-center text-xs text-muted-foreground">
          Can't find the email? Check your spam folder or click above to resend.
          The verification link will expire in 24 hours.
        </p>
      </CardFooter>
    </Card>
  );
}
