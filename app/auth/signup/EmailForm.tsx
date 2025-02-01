import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { emailSchema } from './email.schema';
import type { EmailSchema } from './email.schema';

export function EmailForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailSchema>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = async (data: EmailSchema) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signIn('email', {
        email: data.email,
        redirect: false,
        callbackUrl: '/for-you', // Redirect to feed page after verification
      });

      if (result?.error) {
        setError('Failed to send magic link. Please try again.');
        return;
      }

      setEmailSent(true);
    } catch (error) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
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
      {error && (
        <Alert variant="destructive">
          {error}
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
          disabled={isLoading}
          className="w-full"
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Continue with Email'}
      </Button>
    </form>
  );
}
