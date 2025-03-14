"use client";

import type { FormEvent } from 'react';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Alert } from '@/components/feedback/alert';
import { emailSchema } from './email.schema';
import type { EmailSchema } from './email.schema';

type FormState = {
  isLoading: boolean;
  emailSent: boolean;
  error: string | null;
}

const initialFormState: FormState = {
  isLoading: false,
  emailSent: false,
  error: null,
};

export function EmailSignUpForm(): JSX.Element {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialFormState);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailSchema): Promise<void> => {
    try {
      setFormState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await signIn('email', {
        email: data.email,
        redirect: false,
        callbackUrl: '/for-you', // Direct to feed page after verification
      });

      if (result?.error) {
        setFormState(prev => ({ ...prev, error: 'Failed to send magic link. Please try again.' }));
        return;
      }

      setFormState(prev => ({ ...prev, emailSent: true }));
    } catch (error) {
      setFormState(prev => ({ ...prev, error: 'An unexpected error occurred. Please try again.' }));
      console.error('Sign up error:', error);
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (formState.emailSent) {
    return (
      <div className="space-y-4 text-center">
        <h2 className="text-2xl font-semibold">Check your email</h2>
        <p className="text-muted-foreground">
          We've sent a magic link to your email address.
          Click the link to sign in.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formState.error && (
        <Alert variant="destructive">
          {formState.error}
        </Alert>
      )}
      
      {errors.email && (
        <Alert variant="destructive">
          {errors.email.message}
        </Alert>
      )}

      <div className="space-y-2">
        <Input
          type="email"
          placeholder="Enter your email"
          {...register('email')}
          disabled={formState.isLoading}
          className="w-full"
          aria-label="Email address"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {formState.isLoading ? 'Sending...' : 'Continue with Email'}
      </Button>
    </form>
  );
}
