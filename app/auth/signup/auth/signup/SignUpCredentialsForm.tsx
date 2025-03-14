"use client";

import { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { signUpAction } from './signup.action';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PasswordInput } from '@/components/PasswordInput';
import type { LoginCredentialsFormType } from './signup.schema';
import { LoginCredentialsFormScheme } from './signup.schema';

type FormState = {
  isLoading: boolean;
  error: string | null;
}

const initialFormState: FormState = {
  isLoading: false,
  error: null,
};

export const SignUpCredentialsForm = () => {
  const path = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  
  const form = useForm<LoginCredentialsFormType>({
    resolver: zodResolver(LoginCredentialsFormScheme),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      verifyPassword: '',
    },
    mode: 'onSubmit', // Only validate on submit
    shouldUnregister: false,
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!path.startsWith('/auth/signup')) {
      form.reset(form.formState.defaultValues);
      form.clearErrors();
      setFormState(initialFormState);
    }
  }, [path, form]);

  const onSubmit = async (values: LoginCredentialsFormType) => {
    try {
      setFormState(prev => ({ ...prev, isLoading: true, error: null }));
      
      toast({
        title: 'Creating your account...',
        description: 'Please wait while we set up your workspace.',
      });

      const result = await signUpAction(values);

      if (result?.error) {
        setFormState(prev => ({ ...prev, error: result.error.message }));
        toast({
          variant: 'destructive',
          title: 'Error creating account',
          description: result.error.message || 'Failed to create account. Please try again.',
        });
        return;
      }

      // Show success message and redirect to verify-request
      toast({
        title: 'Account created successfully!',
        description: 'Please check your email to verify your account.',
        variant: 'default',
      });

      // Redirect to verify-request page with email
      router.replace(`/auth/verify-request?email=${encodeURIComponent(values.email)}`, { scroll: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setFormState(prev => ({ ...prev, error: errorMessage }));
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      console.error('Sign up error:', error);
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };



  return (
    <FormProvider {...form}>
      <Toaster />
      <form 
        onSubmit={(e) => {
          e.preventDefault(); // Prevent default form behavior
          form.handleSubmit(onSubmit)(e);
        }} 
        className="space-y-4"
      >
        {formState.error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{formState.error}</AlertDescription>
          </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="John Doe" 
                  {...field} 
                  value={field.value || ''}
                  disabled={formState.isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input 
                  type="email"
                  placeholder="john@doe.com" 
                  {...field} 
                  value={field.value || ''}
                  disabled={formState.isLoading}
                  autoComplete="email"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder="Password"
                  disabled={formState.isLoading}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="verifyPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verify Password</FormLabel>
              <FormControl>
                <PasswordInput
                  {...field}
                  placeholder="Verify password"
                  disabled={formState.isLoading}
                  autoComplete="new-password"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={formState.isLoading}
        >
          {formState.isLoading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </Button>
      </form>
    </FormProvider>
  );
};
