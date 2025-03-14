"use client";

import { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { signUpAction } from './signup.action';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/core/button';
import { Input } from '@/components/core/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/feedback/alert';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/feedback/use-toast';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/core/form';
import { PasswordInput } from '@/components/core/PasswordInput';
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
      displayName: '',
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

      // Handle error from the action result
      if ('error' in result && result.error) {
        const errorMessage = result.error instanceof Error ? result.error.message : 'Failed to create account. Please try again.';
        setFormState(prev => ({ ...prev, error: errorMessage }));
        toast({
          variant: 'destructive',
          title: 'Error creating account',
          description: errorMessage,
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
      // Log error to the server-side logger instead of console
      setFormState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };



  return (
    <FormProvider {...form}>
      <form 
        onSubmit={(e) => {
          e.preventDefault(); // Prevent default form behavior
          void form.handleSubmit(onSubmit)(e);
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
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Name</FormLabel>
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="johndoe" 
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
