"use client";

import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { PasswordInput } from '@/components/PasswordInput';
import type { LoginCredentialsFormType } from './signup.schema';
import { LoginCredentialsFormScheme } from './signup.schema';

interface FormState {
  isLoading: boolean;
  error: string | null;
}

const initialFormState: FormState = {
  isLoading: false,
  error: null,
};

export const SignUpCredentialsForm = () => {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  
  const form = useForm<LoginCredentialsFormType>({
    resolver: zodResolver(LoginCredentialsFormScheme),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      verifyPassword: '',
    },
    mode: 'onBlur',
  });

  const onSubmit = async (values: LoginCredentialsFormType) => {
    try {
      setFormState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const result = await signUpAction(values);

      if (result?.serverError) {
        setFormState(prev => ({ ...prev, error: result.serverError }));
        return;
      }

      const signInResult = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: '/for-you',
      });

      if (signInResult?.error) {
        setFormState(prev => ({ ...prev, error: 'Failed to sign in after account creation.' }));
        return;
      }

      router.push('/for-you');
    } catch (error) {
      setFormState(prev => ({ ...prev, error: 'An unexpected error occurred. Please try again.' }));
      console.error('Sign up error:', error);
    } finally {
      setFormState(prev => ({ ...prev, isLoading: false }));
    }
  };



  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {formState.error && (
          <Alert variant="destructive">
            {formState.error}
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
          {formState.isLoading ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </FormProvider>
  );
};
